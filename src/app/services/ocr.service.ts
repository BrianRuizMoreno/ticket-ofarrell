import { Injectable, inject } from '@angular/core';
import { catchError, from, Observable, throwError } from 'rxjs';
import { IOCROriginalData } from '../core/models/ticket.model';
import { GeminiService } from '../core/services/gemini.service';

@Injectable({
  providedIn: 'root'
})
export class OCRService {
  private readonly gemini = inject(GeminiService);

  processImage(file: File): Observable<IOCROriginalData> {
    if (!navigator.onLine) {
      return throwError(() => new Error('Estás offline. Debes conectarte a internet para procesar tickets.'));
    }

    return from(this.gemini.extractData(file)).pipe(
      catchError((error) => {
        console.warn('Falla en procesamiento Gemini:', error);
        return throwError(() => new Error('Error al procesar el ticket con IA'));
      })
    );
  }
}