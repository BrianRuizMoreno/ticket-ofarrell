import { Environment } from './enviroment.interface';

export const environment: Environment = {
  production: false,
  apiUrl: 'https://autogestion.ivanofarrell.com.ar/phy2service/api',
  rendicionesApiUrl: 'http://localhost:3000/api/rendiciones',
  serialId: '00438_01',
  appName: 'Portal Validador - Physis',
  version: '2.0.0',
  features: {
    offlineMode: true,
    ocrEnabled: false,
    multiEmpresa: true
  }
};