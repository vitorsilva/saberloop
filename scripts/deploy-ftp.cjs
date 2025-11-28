require('dotenv').config();

const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();

const config = {
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    host: process.env.FTP_HOST,
    port: 21,
    localRoot: './dist',
    remoteRoot: '/',
    include: ['*', '**/*'],
    exclude: [],
    deleteRemote: false,  // Don't delete existing files (keeps api/, src/, .env)
    forcePasv: true
};

ftpDeploy
    .deploy(config)
    .then(res => console.log('✅ Deployment finished:', res))
    .catch(err => console.error('❌ Deployment failed:', err));