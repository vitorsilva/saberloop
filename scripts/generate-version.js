  import fs from 'fs';

  const VERSION_FILE = 'src/version.js';
  const VERSION_HISTORY = '.version-history.json';

  function generateVersion() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // Load version history
    let history = { lastDate: '', lastSeq: 0 };
    if (fs.existsSync(VERSION_HISTORY)) {
      history = JSON.parse(fs.readFileSync(VERSION_HISTORY, 'utf8'));        
    }

    // Determine sequence number
    let seq = 1;
    if (history.lastDate === dateStr) {
      seq = history.lastSeq + 1;
    }

    // Format: YYYYMMDD.NN (e.g., 20251126.01)
    const version = `${dateStr}.${String(seq).padStart(2, '0')}`;

    // Save history
    fs.writeFileSync(VERSION_HISTORY, JSON.stringify({
      lastDate: dateStr,
      lastSeq: seq
    }, null, 2));

    // Generate version module
    const versionModule = `// Auto-generated - do not edit manually
  export const APP_VERSION = '${version}';
  export const BUILD_DATE = '${now.toISOString()}';
  `;

    fs.writeFileSync(VERSION_FILE, versionModule);
    console.log(`✅ Generated version: ${version}`);

    return version;
  }

  generateVersion();