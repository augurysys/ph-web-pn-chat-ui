import { environment } from '@seebo/ph-ms-env-manager/dist/envVars';

import createLog = require('@seebo/logger');

const app = 'platform';

export default createLog({ app, environment });
