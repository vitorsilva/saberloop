require('dotenv').config();
const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();

// FTP configuration for saberloop.com
const baseConfig = {
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    host: process.env.FTP_HOST,
    port: 21,
    forcePasv: true,
    deleteRemote: false
};

// Deploy frontend to /app/ subdirectory
// saberloop.com/app/ will host the PWA
// saberloop.com/ (root) reserved for future landing page
const frontendConfig = {
    ...baseConfig,
    localRoot: './dist',
    remoteRoot: '/app',
    include: ['*', '**/*'],
    exclude: []
};

async function deploy() {
    try {
        console.log('📦 Deploying frontend to saberloop.com/app/...');
        await ftpDeploy.deploy(frontendConfig);
        console.log('✅ Frontend deployed!');

        console.log('🎉 Deployment complete!');
        console.log('🌐 Visit: https://saberloop.com/app/');
    } catch (err) {
        console.error('❌ Deployment failed:', err);
        process.exit(1);
    }
}

deploy();