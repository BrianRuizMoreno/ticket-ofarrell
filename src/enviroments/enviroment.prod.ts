import { Environment } from './enviroment.interface';

export const environment: Environment = {
  production: true,
  apiUrl: 'https://autogestion.ivanofarrell.com.ar/phy2service/api',
  ocrWebhook: 'http://localhost:3000/api/ai/analizar-ticket',
  saveWebhook: 'http://localhost:3000/api/rendiciones/recibir',
  serialId: '00438_01',
  appName: 'Tickets Physis',
  version: '1.0.0',
  geminiKeys: ['AIzaSyD8Y23eMeln6x5X-LQoy2SedrfSZ6QqtTU'], // Agrega más keys aquí
  features: {
    offlineMode: true,
    ocrEnabled: true,
    multiEmpresa: true
  }
};