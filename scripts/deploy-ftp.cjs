require('dotenv').config();
const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();

const baseConfig = {
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    host: process.env.FTP_HOST,
    port: 21,
    forcePasv: true,
    deleteRemote: false
};

// Deploy frontend (dist/)
const frontendConfig = {
    ...baseConfig,
    localRoot: './dist',
    remoteRoot: '/',
    include: ['*', '**/*'],
    exclude: []
};

// Deploy PHP backend (php-api/)
const phpConfig = {
    ...baseConfig,
    localRoot: './php-api',
    remoteRoot: '/',
    include: ['**/*.php', '.htaccess'],
    exclude: ['composer.json', 'composer.lock', 'vendor/**', 'tests/**', 'phpunit.xml','.env', '.env.example', 'Dockerfile']
};

async function deploy() {
    try {
        console.log('📦 Deploying frontend...');
        await ftpDeploy.deploy(frontendConfig);
        console.log('✅ Frontend deployed!');

        console.log('🐘 Deploying PHP backend...');
        await ftpDeploy.deploy(phpConfig);
        console.log('✅ PHP backend deployed!');

        console.log('🎉 All deployments complete!');
    } catch (err) {
        console.error('❌ Deployment failed:', err);
        process.exit(1);
    }
}

deploy();