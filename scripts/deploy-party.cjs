require('dotenv').config();
const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();

// FTP configuration for saberloop.com party backend
const config = {
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    host: process.env.FTP_HOST,
    port: 21,
    forcePasv: true,
    secure: true,
    secureOptions: { rejectUnauthorized: false },
    localRoot: './php-api/party',
    remoteRoot: '/party',  // saberloop.com/party/
    include: [
        '*.php',
        '*.example.php',
        '.htaccess',
        'endpoints/*.php',
        'migrations/*.sql',
    ],
    exclude: [],
    deleteRemote: false
};

async function deploy() {
    try {
        console.log('🎉 Deploying party backend to saberloop.com/party/...');
        console.log('');
        await ftpDeploy.deploy(config);
        console.log('✅ Party backend deployed!');
        console.log('');
        console.log('📁 Deployed files:');
        console.log('   - config.php');
        console.log('   - config.local.example.php');
        console.log('   - .htaccess');
        console.log('   - test-db.php (temporary)');
        console.log('');
        console.log('⚠️  IMPORTANT - Create config.local.php on the server:');
        console.log('   1. SSH into the server or use cPanel File Manager');
        console.log('   2. Navigate to /party/ directory');
        console.log('   3. Copy config.local.example.php to config.local.php');
        console.log('   4. Edit config.local.php and set your database credentials:');
        console.log('');
        console.log("      return [");
        console.log("          'db' => [");
        console.log("              'host' => 'localhost',");
        console.log("              'dbname' => 'mdemaria_saberloop_party',");
        console.log("              'username' => 'mdemaria_party',");
        console.log("              'password' => 'YOUR_PASSWORD_HERE',");
        console.log("          ],");
        console.log("      ];");
        console.log('');
        console.log('🔗 Test the connection: https://saberloop.com/party/test-db.php');
        console.log('');
        console.log('🗑️  Remember to delete test-db.php after testing!');
    } catch (err) {
        console.error('❌ Deployment failed:', err);
        process.exit(1);
    }
}

deploy();
