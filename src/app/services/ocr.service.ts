import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';

import { environment } from '../../enviroments/enviroment';
import { OCROriginalData } from '../core/models/ticket.model';
import { JsonObject } from '../core/types/json.types';

interface OCRResponse {
  readonly content?: {
    readonly parts?: ReadonlyArray<{
      readonly text?: string;
    }>;
  };
  readonly text?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OCRService {
  private readonly http = inject(HttpClient);
  private readonly webhookUrl = environment.ocrWebhook;

  processImage(file: File): Observable<OCROriginalData> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<OCRResponse | JsonObject>(this.webhookUrl, formData).pipe(
      map((response: OCRResponse | JsonObject) => this.parseOCRResponse(response)),
      catchError((error: Error) => {
        console.error('OCR Service Error:', error);
        return throwError(() => new Error('Error en servicio OCR'));
      })
    );
  }

  private parseOCRResponse(response: OCRResponse | JsonObject): OCROriginalData {
    if ('content' in response && (response as OCRResponse).content?.parts?.[0]?.text) {
      try {
        const parsed = JSON.parse((response as OCRResponse).content!.parts![0].text!) as JsonObject;
        return parsed as OCROriginalData;
      } catch {
        return response as OCROriginalData;
      }
    }

    if ('text' in response && typeof response.text === 'string') {
      try {
        const parsed = JSON.parse(response.text) as JsonObject;
        return parsed as OCROriginalData;
      } catch {
        return response as OCROriginalData;
      }
    }

    return response as OCROriginalData;
  }
}