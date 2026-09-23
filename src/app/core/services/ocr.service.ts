import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment';
import { IOCROriginalData, TipoGasto, MetodoPago } from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class OCRService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = environment.ocrEndpoint;

  /**
   * Envía la imagen del comprobante al servidor backend para su análisis
   * mediante IA (Gemini). La API Key y los prompts residen de forma segura en el servidor.
   * Aplica política estricta de 3 reintentos.
   */
  processImage(file: File | Blob): Observable<IOCROriginalData> {
    if (!navigator.onLine) {
      return throwError(() => new Error('Estás offline. Debes conectarte a internet para procesar tickets con IA.'));
    }

    const formData = new FormData();
    const fileName = file instanceof File ? file.name : `ticket_${Date.now()}.jpg`;
    formData.append('imagen', file, fileName);

    return this.http.post<Record<string, unknown>>(this.endpoint, formData).pipe(
      retry({ count: 3, delay: 1000 }),
      map((response: Record<string, unknown>) => this.normalizeOCRResponse(response)),
      catchError((error: HttpErrorResponse | Error) => {
        const errorMsg = error instanceof HttpErrorResponse
          ? `Error del servidor OCR (HTTP ${error.status})`
          : (error?.message || 'Error de conexión con el servicio OCR');
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  private normalizeOCRResponse(parsed: Record<string, unknown>): IOCROriginalData {
    const total = typeof parsed['total'] === 'number' ? parsed['total'] : Number(parsed['total']) || 0;
    const iva = typeof parsed['iva'] === 'number' ? parsed['iva'] : Number(parsed['iva']) || 0;
    let monto = typeof parsed['monto'] === 'number' ? parsed['monto'] : Number(parsed['monto']) || 0;

    if (!monto && total) {
      monto = Math.max(0, total - iva);
    }

    const tipoGastoRaw = typeof parsed['tipo_gasto'] === 'string' ? parsed['tipo_gasto'] : 'OTROS';
    const validTipos: ReadonlyArray<TipoGasto> = [
      'COMBUSTIBLE', 'COMIDA', 'TRANSPORTE', 'PERSONAL', 'PEAJES', 'ALOJAMIENTOS', 'SERVICIOS', 'LIBRERIA', 'OTROS'
    ];
    const tipoGasto: TipoGasto = validTipos.includes(tipoGastoRaw as TipoGasto)
      ? (tipoGastoRaw as TipoGasto)
      : 'OTROS';

    const metodoPagoRaw = typeof parsed['metodo_pago'] === 'string' ? parsed['metodo_pago'] : 'Efectivo';
    const validMetodos: ReadonlyArray<MetodoPago> = [
      'Efectivo', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'Transferencia'
    ];
    const metodoPago: MetodoPago = validMetodos.includes(metodoPagoRaw as MetodoPago)
      ? (metodoPagoRaw as MetodoPago)
      : 'Efectivo';

    return {
      razon_social: typeof parsed['razon_social'] === 'string' ? parsed['razon_social'].trim() : '',
      cuit: typeof parsed['cuit'] === 'string' ? parsed['cuit'].trim() : '',
      n_operacion: typeof parsed['n_operacion'] === 'string' ? parsed['n_operacion'].trim() : '',
      tipo_gasto: tipoGasto,
      metodo_pago: metodoPago,
      fecha: typeof parsed['fecha'] === 'string' ? parsed['fecha'] : new Date().toISOString().split('T')[0],
      monto,
      iva,
      total,
      vendor: typeof parsed['vendor'] === 'string' ? parsed['vendor'].trim() : '',
      items: Array.isArray(parsed['items']) ? parsed['items'].map(String) : []
    };
  }
}
