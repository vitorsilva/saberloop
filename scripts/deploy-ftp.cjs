require('dotenv').config();
const fs = require('fs');
const path = require('path');
const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();

// Check for --staging flag
const isStaging = process.argv.includes('--staging');
const targetPath = isStaging ? '/app-staging' : '/app';
const expectedBase = isStaging ? '/app-staging/' : '/app/';

// Validate manifest matches deployment target
function validateManifest() {
    const manifestPath = path.join(__dirname, '..', 'dist', 'manifest.webmanifest');

    if (!fs.existsSync(manifestPath)) {
        console.error('❌ Error: dist/manifest.webmanifest not found. Run npm run build first.');
        process.exit(1);
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const manifestBase = manifest.scope || manifest.start_url;

    if (manifestBase !== expectedBase) {
        console.error('❌ Build/deploy mismatch detected!');
        console.error(`   Manifest has: ${manifestBase}`);
        console.error(`   Expected for ${isStaging ? 'staging' : 'production'}: ${expectedBase}`);
        console.error('');
        if (isStaging) {
            console.error('   To fix: DEPLOY_TARGET=staging npm run build');
        } else {
            console.error('   To fix: npm run build (without DEPLOY_TARGET)');
        }
        process.exit(1);
    }

    console.log(`✅ Manifest validated: ${manifestBase}`);
}

// FTP configuration for saberloop.com
const baseConfig = {
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    host: process.env.FTP_HOST,
    port: 21,
    forcePasv: true,
    secure: true,
    secureOptions: { rejectUnauthorized: false },
    deleteRemote: false
};

// Deploy frontend to target subdirectory
const frontendConfig = {
    ...baseConfig,
    localRoot: './dist',
    remoteRoot: targetPath,
    include: ['*', '**/*'],
    exclude: []
};

async function deploy() {
    try {
        // Validate before deploying
        validateManifest();

        const targetUrl = `https://saberloop.com${targetPath}/`;
        console.log(`📦 Deploying frontend to ${targetUrl}...`);
        await ftpDeploy.deploy(frontendConfig);
        console.log('✅ Frontend deployed!');

        console.log('🎉 Deployment complete!');
        console.log(`🌐 Visit: ${targetUrl}`);
    } catch (err) {
        console.error('❌ Deployment failed:', err);
        process.exit(1);
    }
}

deploy();