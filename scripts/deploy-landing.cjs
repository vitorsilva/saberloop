require('dotenv').config();
const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();

// FTP configuration for saberloop.com landing page
const config = {
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    host: process.env.FTP_HOST,
    port: 21,
    forcePasv: true,
    secure: true,
    secureOptions: { rejectUnauthorized: false },
    localRoot: './landing',
    remoteRoot: '/',  // Root of the domain
    include: ['*', '**/*'],
    exclude: [],
    deleteRemote: false
};

async function deploy() {
    try {
        console.log('📦 Deploying landing page to saberloop.com/...');
        await ftpDeploy.deploy(config);
        console.log('✅ Landing page deployed!');
        console.log('🌐 Visit: https://saberloop.com/');
    } catch (err) {
        console.error('❌ Deployment failed:', err);
        process.exit(1);
    }
}

deploy();
