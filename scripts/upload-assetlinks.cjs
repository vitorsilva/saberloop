
require('dotenv').config();
const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();

const config = {
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  host: process.env.FTP_HOST,
  port: 21,
  forcePasv: true,
  secure: true,
  secureOptions: { rejectUnauthorized: false },
  localRoot: './',
  remoteRoot: '/.well-known',
  include: ['assetlinks.json'],
  exclude: [],
  deleteRemote: false
};

async function upload() {
  try {
	  console.log('📤 Uploading assetlinks.json to /.well-known/...');
	  await ftpDeploy.deploy(config);
	  console.log('✅ Upload complete!');
	  console.log('🔗 Verify: https://saberloop.com/.well-known/assetlinks.json');
  } catch (err) {
	  console.error('❌ Upload failed:', err);
	  process.exit(1);
  }
}

upload();