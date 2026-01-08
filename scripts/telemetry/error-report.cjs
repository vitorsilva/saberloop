/**
 * Error Report - Analyze telemetry data for errors
 *
 * Usage: node scripts/telemetry/error-report.cjs [input-dir]
 *
 * Reads .jsonl files and generates an error analysis report.
 * No Docker/Loki required - works directly with downloaded log files.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const INPUT_DIR = process.argv[2] || './telemetry-logs';

async function main() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║           SABERLOOP TELEMETRY ERROR REPORT                   ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');

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

    console.log(`Analyzing ${files.length} log file(s)...`);
    console.log('');

    // Collect all events
    const errors = [];
    const warnings = [];
    const failedMetrics = [];
    const sessions = new Set();
    let totalEvents = 0;

    for (const file of files) {
        const filePath = path.join(INPUT_DIR, file);
        const events = await readJsonlFile(filePath);

        for (const event of events) {
            totalEvents++;
            sessions.add(event.sessionId);

            if (event.type === 'error') {
                errors.push(event);
            } else if (event.type === 'log' && event.data?.level === 'warn') {
                warnings.push(event);
            } else if (event.type === 'metric' && event.data?.status === 'error') {
                failedMetrics.push(event);
            }
        }
    }

    // Group errors by message
    const errorsByMessage = groupByMessage(errors);
    const warningsByMessage = groupByMessage(warnings);
    const failedMetricsByName = groupByName(failedMetrics);

    // Get sessions with errors
    const sessionsWithErrors = new Set();
    errors.forEach(e => sessionsWithErrors.add(e.sessionId));

    // Print summary
    printSection('SUMMARY');
    console.log(` Total Events:        ${totalEvents.toLocaleString()}`);
    console.log(` Total Errors:        ${errors.length} (${pct(errors.length, totalEvents)})`);
    console.log(` Total Warnings:      ${warnings.length} (${pct(warnings.length, totalEvents)})`);
    console.log(` Failed Metrics:      ${failedMetrics.length}`);
    console.log(` Sessions Analyzed:   ${sessions.size}`);
    console.log(` Sessions w/Errors:   ${sessionsWithErrors.size} (${pct(sessionsWithErrors.size, sessions.size)})`);
    console.log('');

    // Print top errors
    if (errors.length > 0) {
        printSection('TOP ERRORS (by frequency)');
        printTopItems(errorsByMessage, 10);
    } else {
        printSection('ERRORS');
        console.log(' No errors found! 🎉');
        console.log('');
    }

    // Print top warnings
    if (warnings.length > 0) {
        printSection('TOP WARNINGS');
        printTopItems(warningsByMessage, 5);
    }

    // Print failed metrics (quiz generation, etc.)
    if (failedMetrics.length > 0) {
        printSection('FAILED OPERATIONS');
        printTopMetrics(failedMetricsByName, 5);
    }

    // Print error patterns
    if (errors.length > 0) {
        printSection('ERROR PATTERNS');
        printPatterns(errors);
    }

    // Print recommendations
    if (errors.length > 0 || failedMetrics.length > 0) {
        printSection('RECOMMENDATIONS');
        printRecommendations(errorsByMessage, failedMetricsByName);
    }

    console.log('─'.repeat(66));
    console.log(`Report generated: ${new Date().toISOString()}`);
    console.log('');
}

async function readJsonlFile(filePath) {
    const events = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        if (!line.trim()) continue;
        try {
            events.push(JSON.parse(line));
        } catch (e) {
            // Skip invalid lines
        }
    }

    return events;
}

function groupByMessage(events) {
    const groups = {};
    for (const event of events) {
        const message = event.data?.message || 'Unknown error';
        if (!groups[message]) {
            groups[message] = {
                message,
                count: 0,
                first: event.timestamp,
                last: event.timestamp,
                sessions: new Set(),
                urls: new Set()
            };
        }
        groups[message].count++;
        groups[message].sessions.add(event.sessionId);
        groups[message].urls.add(event.url);
        if (event.timestamp < groups[message].first) {
            groups[message].first = event.timestamp;
        }
        if (event.timestamp > groups[message].last) {
            groups[message].last = event.timestamp;
        }
    }
    return groups;
}

function groupByName(events) {
    const groups = {};
    for (const event of events) {
        const name = event.data?.name || 'Unknown metric';
        if (!groups[name]) {
            groups[name] = {
                name,
                count: 0,
                errors: {},
                sessions: new Set()
            };
        }
        groups[name].count++;
        groups[name].sessions.add(event.sessionId);

        const error = event.data?.error || 'Unknown';
        groups[name].errors[error] = (groups[name].errors[error] || 0) + 1;
    }
    return groups;
}

function printSection(title) {
    console.log('─'.repeat(66));
    console.log(` ${title}`);
    console.log('─'.repeat(66));
}

function printTopItems(groups, limit) {
    const sorted = Object.values(groups).sort((a, b) => b.count - a.count);
    const top = sorted.slice(0, limit);

    if (top.length === 0) {
        console.log(' None');
        console.log('');
        return;
    }

    top.forEach((item, i) => {
        const num = String(i + 1).padStart(2, ' ');
        console.log(` ${num}. "${truncate(item.message, 50)}" (${item.count}x)`);
        console.log(`     First: ${formatDate(item.first)}`);
        console.log(`     Last:  ${formatDate(item.last)}`);
        console.log(`     Sessions: ${item.sessions.size}`);
        console.log('');
    });
}

function printTopMetrics(groups, limit) {
    const sorted = Object.values(groups).sort((a, b) => b.count - a.count);
    const top = sorted.slice(0, limit);

    if (top.length === 0) {
        console.log(' None');
        console.log('');
        return;
    }

    top.forEach((item, i) => {
        const num = String(i + 1).padStart(2, ' ');
        console.log(` ${num}. ${item.name}: ${item.count} failures`);
        console.log(`     Sessions: ${item.sessions.size}`);
        console.log(`     Reasons:`);
        Object.entries(item.errors)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .forEach(([error, count]) => {
                console.log(`       - ${truncate(error, 45)}: ${count}`);
            });
        console.log('');
    });
}

function printPatterns(errors) {
    // By URL
    const byUrl = {};
    errors.forEach(e => {
        const url = e.url?.split('#')[1] || e.url || 'unknown';
        byUrl[url] = (byUrl[url] || 0) + 1;
    });

    console.log(' By Page:');
    Object.entries(byUrl)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .forEach(([url, count]) => {
            const pctStr = pct(count, errors.length);
            console.log(`   ${url}: ${count} errors (${pctStr})`);
        });
    console.log('');

    // By hour
    const byHour = {};
    errors.forEach(e => {
        const hour = new Date(e.timestamp).getUTCHours();
        byHour[hour] = (byHour[hour] || 0) + 1;
    });

    const peakHour = Object.entries(byHour).sort(([, a], [, b]) => b - a)[0];
    if (peakHour) {
        console.log(` Peak error hour (UTC): ${peakHour[0]}:00 (${peakHour[1]} errors)`);
    }
    console.log('');
}

function printRecommendations(errorsByMessage, failedMetricsByName) {
    const recommendations = [];

    // Check for network errors
    const networkErrors = Object.values(errorsByMessage)
        .filter(e => e.message.toLowerCase().includes('fetch') ||
                    e.message.toLowerCase().includes('network'))
        .reduce((sum, e) => sum + e.count, 0);

    if (networkErrors > 0) {
        recommendations.push({
            priority: 'HIGH',
            issue: `Network errors: ${networkErrors} occurrences`,
            action: 'Consider adding retry logic with exponential backoff'
        });
    }

    // Check for API key errors
    const apiKeyErrors = Object.values(errorsByMessage)
        .filter(e => e.message.toLowerCase().includes('api key') ||
                    e.message.toLowerCase().includes('401'))
        .reduce((sum, e) => sum + e.count, 0);

    if (apiKeyErrors > 0) {
        recommendations.push({
            priority: 'HIGH',
            issue: `API key issues: ${apiKeyErrors} occurrences`,
            action: 'Improve onboarding flow for OpenRouter setup'
        });
    }

    // Check for quiz generation failures
    const quizFailures = failedMetricsByName['quiz_generation'];
    if (quizFailures && quizFailures.count > 0) {
        recommendations.push({
            priority: 'MEDIUM',
            issue: `Quiz generation failures: ${quizFailures.count} occurrences`,
            action: 'Review LLM response parsing and add fallback handling'
        });
    }

    if (recommendations.length === 0) {
        console.log(' No specific recommendations - error rate is low!');
        console.log('');
        return;
    }

    recommendations.forEach((rec, i) => {
        console.log(` ${i + 1}. [${rec.priority}] ${rec.issue}`);
        console.log(`    → ${rec.action}`);
        console.log('');
    });
}

function pct(num, total) {
    if (total === 0) return '0%';
    return `${((num / total) * 100).toFixed(1)}%`;
}

function formatDate(isoString) {
    if (!isoString) return 'N/A';
    return new Date(isoString).toISOString().split('T')[0];
}

function truncate(str, maxLen) {
    if (!str) return '';
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen - 3) + '...';
}

main().catch(console.error);
