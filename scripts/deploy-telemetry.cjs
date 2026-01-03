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
    include: ['*.php', '*.example.php', '.htaccess'],
    exclude: ['logs/**'],  // Never upload log files
    deleteRemote: false
};

async function deploy() {
    try {
        console.log('📡 Deploying telemetry endpoint to saberloop.com/telemetry/...');
        console.log('   Files: config.php, config.local.example.php, ingest.php, rotate-logs.php, .htaccess');
        await ftpDeploy.deploy(config);
        console.log('✅ Telemetry endpoint deployed!');
        console.log('🔗 Endpoint: https://saberloop.com/telemetry/ingest.php');
        console.log('');
        console.log('⚠️  IMPORTANT - Create config.local.php on the server:');
        console.log('   1. SSH into the server or use FTP');
        console.log('   2. Navigate to /telemetry/ directory');
        console.log('   3. Copy config.local.example.php to config.local.php');
        console.log('   4. Edit config.local.php and set your token:');
        console.log('      return [\'token\' => \'your-actual-VITE_TELEMETRY_TOKEN-value\'];');
        console.log('   5. The token MUST match VITE_TELEMETRY_TOKEN in frontend .env');
        console.log('');
        console.log('📁 Also remember to:');
        console.log('   - Create logs directory with write permissions (chmod 755)');
        console.log('   - Set up cron job for rotate-logs.php');
    } catch (err) {
        console.error('❌ Deployment failed:', err);
        process.exit(1);
    }
}

deploy();
