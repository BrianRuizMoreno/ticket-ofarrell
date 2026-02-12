import { Environment } from './enviroment.interface';

export const environment: Environment = {
  production: true,
  apiUrl: 'https://autogestion.ivanofarrell.com.ar/phy2service/api',
  ocrWebhook: 'https://n8n.automatizaciones-physis.cloud/webhook/ProcesaImagen',
  saveWebhook: 'https://n8n.automatizaciones-physis.cloud/webhook/RecibeInfo',
  serialId: '00438_01',
  appName: 'Tickets Physis',
  version: '1.0.0',
  features: {
    offlineMode: true,
    ocrEnabled: true,
    multiEmpresa: true
  }
};