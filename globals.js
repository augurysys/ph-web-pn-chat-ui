const dotenv = require('dotenv');

function loadEnvVars(env = 'local') {
  dotenv.config({ path: __dirname + `/env/.env.${env}` });
}

function getGlobals() {
  const config = process.env;
  const ENV = config['ENV'];
  return {
    servicesUrls: {
      chat: config['PH_CHAT_BASE_URL'],
    },
    keys: {},
    publicConfig: {
      ENV,
    },
    mfUrls: {
      chat_mf: config['CHAT_MF'],
    },
  };
}

module.exports = {
  loadEnvVars,
  getGlobals,
};
