export interface AppFeatures {
  readonly offlineMode: boolean;
  readonly ocrEnabled: boolean;
  readonly multiEmpresa: boolean;
}

export interface Environment {
  readonly production: boolean;
  readonly apiUrl: string;
  readonly ocrWebhook: string;
  readonly saveWebhook: string;
  readonly serialId: string;
  readonly appName: string;
  readonly version: string;
  readonly features: AppFeatures;
}