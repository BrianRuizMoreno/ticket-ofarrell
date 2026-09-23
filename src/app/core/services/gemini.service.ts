import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';
import { IOCROriginalData } from '../models/ticket.model';

/**
 * GeminiService — Se comunica con el proxy Backend (ScannerValidator)
 * para realizar el análisis de comprobantes, manteniendo la API Key oculta.
 */
@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private readonly http = inject(HttpClient);
  
  /**
   * Extrae datos de un ticket enviando la imagen al servidor backend.
   */
  async extractData(file: File): Promise<IOCROriginalData> {
    if (!navigator.onLine) {
      throw new Error('No hay conexión a internet para procesar el ticket.');
    }

    const formData = new FormData();
    formData.append('imagen', file);

    try {
      console.log('Enviando ticket al servidor proxy para análisis OCR...');
      
      const result = await firstValueFrom(
        this.http.post<IOCROriginalData>(environment.ocrWebhook, formData)
      );
      
      return result;
    } catch (error: any) {
      console.error('Error al comunicarse con el proxy OCR:', error);
      
      if (error.status === 500) {
        throw new Error('El servidor falló al analizar la imagen. La IA no pudo devolver un formato correcto.');
      }
      
      if (error.status === 400) {
        throw new Error('Error de validación: ' + (error.error?.error || 'Petición incorrecta'));
      }

      throw new Error('No se pudo conectar con el servidor proxy de IA.');
    }
  }
}
