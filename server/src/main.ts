import './config/env';
import { port } from './config/env';
import logger from './config/logger';
import { environment } from '@seebo/ph-ms-env-manager/dist/envVars';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import ejs from 'ejs';
import * as express from 'express';
import { Express } from 'express';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';

const yaml = require('js-yaml');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '5mb' }));

function createServer(app: Express) {
  if (environment === 'local') {
    const privateKey = fs.readFileSync('cert/server.key', 'utf8');
    const certificate = fs.readFileSync('cert/server.crt', 'utf8');
    const appcert = fs.readFileSync('cert/ca.crt', 'utf8');
    const credentials = { key: privateKey, cert: certificate, ca: appcert };
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    return https.createServer(credentials, app);
  } else {
    return http.createServer(app);
  }
}

app.use(express.static(path.resolve(__dirname, '../dist'), { index: '../views/index.html' }));

app.set('view engine', 'ejs');
app.get('*', (req, res) => {
  let fullDataPath;
  if (environment === 'local') {
    fullDataPath = path.join('./platform_application.yaml');
  } else {
    fullDataPath = path.join('/etc/config/platform_application.yaml');
  }
  const data = yaml.load(fs.readFileSync(fullDataPath, 'utf8'));
  res.render('index', {
    env_data_environment: data.ENV,
    env_data_servicesUrls: data.SERVICES_URLS,
    env_data_react_bundle_url: data.REACT_BUNDLE_URL,
    env_data_keys: data.KEYS,
    env_data_mfUrls: data.MF_URLS,
  });
});

const main = createServer(app);
main.listen(port, () => {
  logger.info(`Chat service running on ${port}`);
});
