import { Environment } from './enviroment.interface';

export const environment: Environment = {
  production: true,
  apiUrl: 'https://autogestion.ivanofarrell.com.ar/phy2service/api',
  ocrEndpoint: 'https://api.autoscaner.pro/api/ai/analizar-ticket',
  saveWebhook: 'https://api.autoscaner.pro/api/rendiciones/recibir',
  serialId: '00438_01',
  appName: 'Tickets Physis',
  version: '2.0.0',
  features: {
    offlineMode: true,
    ocrEnabled: true,
    multiEmpresa: true
  }
};