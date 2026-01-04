/**
 * Automated screenshot processor for landing page and Play Store assets.
 *
 * Features:
 * - Resize to consistent dimensions
 * - Add device frame overlay (optional)
 * - Optimize file size
 * - Batch process multiple images
 * - Preset configurations for different use cases
 *
 * Usage:
 *   node scripts/process-screenshots.cjs                    # Uses 'landing' preset
 *   node scripts/process-screenshots.cjs --preset playstore # Uses 'playstore' preset (1080x1920)
 *   node scripts/process-screenshots.cjs --input DIR --output DIR
 *   node scripts/process-screenshots.cjs --no-frame         # Skip device frame
 *
 * Presets:
 *   - landing:   280x560, with device frame (for landing page)
 *   - playstore: 1080x1920, no frame (for Google Play Store)
 *
 * @requires sharp
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration presets
const PRESETS = {
  // Landing page preset (Phase 52)
  landing: {
    inputDir: '.maestro/tests/screenshots',
    outputDir: 'docs/product-info/screenshots/landing',
    targetWidth: 280,
    targetHeight: 560,
    useDeviceFrame: true,
    frameColor: '#1a1a2e',
    framePadding: 12,
    frameRadius: 24,
    quality: 85,
    outputPrefix: 'landing-', // Prefix for landing page files
    includePatterns: [
      '02-quiz-started.png',
      '03-results-page.png',
      '06-settings-page.png',
      '08-usage-cost-card.png',
      'landing-explanation-modal.png',
      'landing-share-results.png',
      'landing-usage-cost.png',
    ],
  },

  // Play Store preset (Phase 53)
  playstore: {
    inputDir: 'docs/product-info/screenshots/playstore',
    outputDir: 'docs/product-info/screenshots/playstore/processed',
    targetWidth: 1080,
    targetHeight: 1920,
    useDeviceFrame: false, // Play Store doesn't need device frames
    quality: 90,
    outputPrefix: '', // No prefix for Play Store (keep original names)
    includePatterns: [
      '01-quiz-question.png',
      '02-explanation-modal.png',
      '03-results-continue.png',
      '04-settings.png',
      '05-home-history.png',
      '06-share-results.png',
      '07-topic-input.png',
      '08-portuguese-quiz.png',
    ],
  },
};

// Default to landing preset, can be overridden via --preset CLI arg
const args = process.argv.slice(2);
const presetName = args.includes('--preset')
  ? args[args.indexOf('--preset') + 1]
  : 'landing';

const CONFIG = {
  ...PRESETS[presetName] || PRESETS.landing,
};

/**
 * Add a device frame around the screenshot
 */
async function addDeviceFrame(inputBuffer, options = {}) {
  const {
    padding = CONFIG.framePadding,
    radius = CONFIG.frameRadius,
    frameColor = CONFIG.frameColor
  } = options;

  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  const newWidth = metadata.width + (padding * 2);
  const newHeight = metadata.height + (padding * 2);

  // Create frame with rounded corners
  const frame = Buffer.from(`
    <svg width="${newWidth}" height="${newHeight}">
      <rect x="0" y="0" width="${newWidth}" height="${newHeight}"
            rx="${radius}" ry="${radius}" fill="${frameColor}"/>
    </svg>
  `);

  // Composite: frame background + screenshot
  return sharp(frame)
    .composite([{
      input: inputBuffer,
      top: padding,
      left: padding,
    }])
    .png()
    .toBuffer();
}

/**
 * Process a single screenshot
 */
async function processScreenshot(inputPath, outputPath, options = {}) {
  const {
    width = CONFIG.targetWidth,
    height = CONFIG.targetHeight,
    useFrame = CONFIG.useDeviceFrame,
    quality = CONFIG.quality
  } = options;

  console.log(`Processing: ${path.basename(inputPath)}`);

  // Read and resize
  let buffer = await sharp(inputPath)
    .resize(width, height, {
      fit: 'cover',
      position: 'top',
    })
    .png({ quality })
    .toBuffer();

  // Add device frame if enabled
  if (useFrame) {
    buffer = await addDeviceFrame(buffer);
  }

  // Optimize and save
  await sharp(buffer)
    .png({
      quality,
      compressionLevel: 9,
    })
    .toFile(outputPath);

  const stats = await fs.stat(outputPath);
  console.log(`  -> ${path.basename(outputPath)} (${(stats.size / 1024).toFixed(1)} KB)`);
}

/**
 * Process all screenshots in batch
 */
async function processAll() {
  const cliArgs = process.argv.slice(2);

  // Parse CLI arguments
  const inputDir = cliArgs.includes('--input')
    ? cliArgs[cliArgs.indexOf('--input') + 1]
    : CONFIG.inputDir;
  const outputDir = cliArgs.includes('--output')
    ? cliArgs[cliArgs.indexOf('--output') + 1]
    : CONFIG.outputDir;
  const useFrame = cliArgs.includes('--no-frame') ? false : CONFIG.useDeviceFrame;

  console.log('\nScreenshot Processor');
  console.log('========================');
  console.log(`Preset: ${presetName}`);
  console.log(`Input:  ${inputDir}`);
  console.log(`Output: ${outputDir}`);
  console.log(`Size:   ${CONFIG.targetWidth}x${CONFIG.targetHeight}`);
  console.log(`Frame:  ${useFrame ? 'Yes' : 'No'}`);
  console.log('');

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Get list of files to process
  let files;
  try {
    files = await fs.readdir(inputDir);
  } catch (err) {
    console.error(`Error reading input directory: ${inputDir}`);
    console.error(err.message);
    process.exit(1);
  }

  const toProcess = files.filter(f =>
    CONFIG.includePatterns.some(pattern => f.includes(pattern.replace('.png', '')))
  );

  if (toProcess.length === 0) {
    console.log('No matching files found. Check includePatterns in CONFIG.');
    console.log('Available files:', files.filter(f => f.endsWith('.png')).join(', '));
    return;
  }

  console.log(`Found ${toProcess.length} files to process:\n`);

  // Process each file
  const prefix = CONFIG.outputPrefix || '';
  for (const file of toProcess) {
    const inputPath = path.join(inputDir, file);
    // Apply prefix from config, avoid double-prefixing
    const outputName = file.startsWith(prefix) ? file : `${prefix}${file}`;
    const outputPath = path.join(outputDir, outputName);

    try {
      await processScreenshot(inputPath, outputPath, { useFrame });
    } catch (err) {
      console.error(`  x Error processing ${file}:`, err.message);
    }
  }

  console.log('\nDone!\n');
}

// Run if called directly
if (require.main === module) {
  processAll().catch(console.error);
}

module.exports = { processScreenshot, addDeviceFrame, processAll };
