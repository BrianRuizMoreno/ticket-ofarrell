import { Environment } from './enviroment.interface';

export const environment: Environment = {
  production: true,
  apiUrl: 'https://autogestion.ivanofarrell.com.ar/phy2service/api',
  saveWebhook: 'http://localhost:3000/api/rendiciones/recibir',
  serialId: '00438_01',
  appName: 'Tickets Physis',
  version: '2.0.0',
  geminiConfig: {
    primaryModel: 'gemini-2.5-flash-lite',
    fallbackModel: 'gemini-2.5-flash',
    apiKeys: ['AIzaSyD8Y23eMeln6x5X-LQoy2SedrfSZ6QqtTU']
  },
  features: {
    offlineMode: true,
    ocrEnabled: true,
    multiEmpresa: true
  }
};