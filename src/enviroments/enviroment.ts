import { Environment } from './enviroment.interface';

export const environment: Environment = {
  production: false,
  apiUrl: 'https://autogestion.ivanofarrell.com.ar/phy2service/api',
  ocrWebhook: 'http://localhost:3000/api/ai/analizar-ticket',
  saveWebhook: 'http://localhost:3000/api/rendiciones/recibir',
  serialId: '00438_01',
  appName: 'Tickets Physis',
  version: '1.0.0',
  features: {
    offlineMode: true,
    ocrEnabled: true,
    multiEmpresa: true
  }
};