import { getEnvValue, loadEnvData } from '@seebo/ph-ms-env-manager/dist/env';

//order is important - first common and then private application
//this will give the ability to override common keys values with private ones
loadEnvData('common', true);
loadEnvData('application');

export const port = getEnvValue('PORT');
