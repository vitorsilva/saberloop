/**
 * Import Telemetry Logs to Loki
 *
 * Usage: node scripts/telemetry/import-to-loki.cjs [input-dir]
 *
 * Reads .jsonl files and pushes them to local Loki instance.
 * Loki must be running: docker-compose -f docker-compose.telemetry.yml up -d
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const LOKI_URL = process.env.LOKI_URL || 'http://localhost:3100';
const INPUT_DIR = process.argv[2] || './telemetry-logs';
const BATCH_SIZE = 100;

async function main() {
    console.log('=== Importing Telemetry to Loki ===');
    console.log(`Input: ${INPUT_DIR}`);
    console.log(`Loki: ${LOKI_URL}`);
    console.log('');

    // Check if Loki is running
    try {
        const response = await fetch(`${LOKI_URL}/ready`);
        if (!response.ok) throw new Error('Not ready');
        console.log('✅ Loki is ready');
    } catch (error) {
        console.error('❌ Loki is not running. Start it with:');
        console.error('   docker-compose -f docker-compose.telemetry.yml up -d');
        process.exit(1);
    }

    // Check input directory exists
    if (!fs.existsSync(INPUT_DIR)) {
        console.log(`Directory not found: ${INPUT_DIR}`);
        console.log('Run download script first to get logs from VPS');
        process.exit(0);
    }

    // Get all .jsonl files
    const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.jsonl'));

    if (files.length === 0) {
        console.log(`No .jsonl files found in ${INPUT_DIR}`);
        process.exit(0);
    }

    console.log(`Found ${files.length} log file(s)`);
    console.log('');

    let totalEvents = 0;
    let importedEvents = 0;

    for (const file of files) {
        console.log(`📄 Processing: ${file}`);
        const filePath = path.join(INPUT_DIR, file);

        // Stream file and process in batches (memory efficient)
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let batch = [];
        let fileEvents = 0;

        for await (const line of rl) {
            if (!line.trim()) continue;

            try {
                const parsed = JSON.parse(line);
                batch.push({ raw: line, parsed });
                fileEvents++;
                totalEvents++;

                // Push when batch is full - don't accumulate in memory
                if (batch.length >= BATCH_SIZE) {
                    const success = await pushToLoki(batch);
                    if (success) {
                        importedEvents += batch.length;
                    }
                    batch = [];  // Clear immediately after push
                    process.stdout.write(`   Imported ${importedEvents} events...\r`);
                }
            } catch (e) {
                // Skip invalid lines
            }
        }

        // Push remaining events in batch
        if (batch.length > 0) {
            const success = await pushToLoki(batch);
            if (success) {
                importedEvents += batch.length;
            }
        }

        console.log(`   ✅ Done: ${fileEvents} events`);
    }

    console.log('');
    console.log('=== Import Complete ===');
    console.log(`Total events: ${totalEvents}`);
    console.log(`Imported: ${importedEvents}`);
    console.log('');
    console.log('View in Grafana: http://localhost:3000');
    console.log('  Default login: admin / admin');
    console.log('  Go to Explore > Select Loki > Query logs');
}

async function pushToLoki(events) {
    // Group by type for Loki streams
    const streams = {};

    for (const { raw, parsed } of events) {
        const type = parsed.type || 'unknown';
        const timestamp = new Date(parsed.timestamp || Date.now()).getTime() * 1000000; // ns

        if (!streams[type]) {
            streams[type] = {
                stream: {
                    app: 'saberloop',
                    type: type
                },
                values: []
            };
        }

        streams[type].values.push([String(timestamp), raw]);
    }

    const payload = {
        streams: Object.values(streams)
    };

    try {
        const response = await fetch(`${LOKI_URL}/loki/api/v1/push`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`   Push failed: ${response.status}`);
            return false;
        }
        return true;
    } catch (error) {
        console.error(`   Push failed: ${error.message}`);
        return false;
    }
}

main().catch(console.error);
