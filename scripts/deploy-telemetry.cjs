require('dotenv').config();
const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();

// FTP configuration for saberloop.com telemetry endpoint
const config = {
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    host: process.env.FTP_HOST,
    port: 21,
    forcePasv: true,
    secure: true,
    secureOptions: { rejectUnauthorized: false },
    localRoot: './php-api/telemetry',
    remoteRoot: '/telemetry',  // saberloop.com/telemetry/
    include: ['*.php', '.htaccess'],
    exclude: ['logs/**'],  // Never upload log files
    deleteRemote: false
};

async function deploy() {
    try {
        console.log('📡 Deploying telemetry endpoint to saberloop.com/telemetry/...');
        console.log('   Files: config.php, ingest.php, rotate-logs.php, .htaccess');
        await ftpDeploy.deploy(config);
        console.log('✅ Telemetry endpoint deployed!');
        console.log('🔗 Endpoint: https://saberloop.com/telemetry/ingest.php');
        console.log('');
        console.log('⚠️  Remember to:');
        console.log('   1. Set TELEMETRY_TOKEN environment variable on VPS');
        console.log('   2. Create logs directory with write permissions');
        console.log('   3. Set up cron job for rotate-logs.php');
    } catch (err) {
        console.error('❌ Deployment failed:', err);
        process.exit(1);
    }
}

deploy();
