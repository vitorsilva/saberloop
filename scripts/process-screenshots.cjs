/**
 * Automated screenshot processor for landing page assets.
 *
 * Features:
 * - Resize to consistent dimensions
 * - Add device frame overlay
 * - Optimize file size
 * - Batch process multiple images
 *
 * Usage:
 *   node scripts/process-screenshots.cjs
 *   node scripts/process-screenshots.cjs --input .maestro/tests/screenshots --output landing/images
 *   node scripts/process-screenshots.cjs --no-frame  # Skip device frame
 *
 * @requires sharp
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  // Input/output directories (can be overridden via CLI)
  inputDir: '.maestro/tests/screenshots',
  outputDir: 'docs/product-info/screenshots/landing',

  // Target dimensions (mobile screenshot)
  targetWidth: 280,
  targetHeight: 560,

  // Device frame settings
  useDeviceFrame: true,
  frameColor: '#1a1a2e', // Match landing page background
  framePadding: 12,
  frameRadius: 24,

  // Optimization
  quality: 85,

  // Files to process (can specify specific files or use wildcard patterns)
  includePatterns: [
    '02-quiz-started.png',
    '03-results-page.png',
    '06-settings-page.png',
    '08-usage-cost-card.png',
  ],
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
  const args = process.argv.slice(2);

  // Parse CLI arguments
  const inputDir = args.includes('--input')
    ? args[args.indexOf('--input') + 1]
    : CONFIG.inputDir;
  const outputDir = args.includes('--output')
    ? args[args.indexOf('--output') + 1]
    : CONFIG.outputDir;
  const useFrame = !args.includes('--no-frame');

  console.log('\nScreenshot Processor');
  console.log('========================');
  console.log(`Input:  ${inputDir}`);
  console.log(`Output: ${outputDir}`);
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
  for (const file of toProcess) {
    const inputPath = path.join(inputDir, file);
    const outputName = `landing-${file}`;
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
