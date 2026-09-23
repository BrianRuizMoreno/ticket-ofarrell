import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';
import { IOCROriginalData } from '../models/ticket.model';

interface IGeminiCandidatePart {
  readonly text?: string;
}

interface IGeminiCandidateContent {
  readonly parts?: ReadonlyArray<IGeminiCandidatePart>;
  readonly role?: string;
}

interface IGeminiCandidate {
  readonly content?: IGeminiCandidateContent;
  readonly finishReason?: string;
}

interface IGeminiGenerateContentResponse {
  readonly candidates?: ReadonlyArray<IGeminiCandidate>;
}

@Injectable({
  providedIn: 'root'
})
export class OCRService {
  private readonly http = inject(HttpClient);
  private currentKeyIndex = 0;

  /**
   * Procesa la imagen del ticket mediante la API oficial de Google Gemini
   * utilizando una cascada de modelos (primario: 2.5 Flash-Lite, respaldo: 2.5 Flash)
   * y rotación automática de llaves.
   */
  processImage(file: File | Blob): Observable<IOCROriginalData> {
    if (!navigator.onLine) {
      return throwError(() => new Error('Estás offline. Debes conectarte a internet para procesar tickets con IA.'));
    }

    return from(this.executeCascade(file));
  }

  private async executeCascade(file: File | Blob): Promise<IOCROriginalData> {
    const base64Data = await this.fileToBase64(file);
    const mimeType = file.type || 'image/jpeg';
    const config = environment.geminiConfig;

    const modelsToTry: string[] = [config.primaryModel, config.fallbackModel];
    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        console.info(`[OCR] Intentando extracción con modelo: ${model}`);
        const result = await this.attemptWithRetriesAndRotation(model, base64Data, mimeType);
        if (result) {
          console.info(`[OCR] Extracción exitosa con modelo ${model}`);
          return result;
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`[OCR] Falla con modelo ${model}: ${lastError.message}. Intentando siguiente nivel de cascada...`);
      }
    }

    throw lastError ?? new Error('No se pudo procesar el comprobante tras agotar la cascada de modelos de IA.');
  }

  private async attemptWithRetriesAndRotation(
    model: string,
    base64Data: string,
    mimeType: string
  ): Promise<IOCROriginalData> {
    const keys = environment.geminiConfig.apiKeys;
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      const apiKey = this.getCurrentApiKey(keys);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const payload = this.buildGeminiPayload(base64Data, mimeType);

      try {
        const response = await this.http.post<IGeminiGenerateContentResponse>(url, payload).toPromise();
        return this.parseGeminiResponse(response);
      } catch (error: unknown) {
        console.warn(`[OCR] Error en intento ${attempt}/${maxRetries} con modelo ${model}:`, error);

        if (error instanceof HttpErrorResponse) {
          // Si es cuota excedida (429) o error de autenticación (401/403), rotamos la key inmediatamente
          if (error.status === 429 || error.status === 403 || error.status === 401) {
            console.warn(`[OCR] Cuota o autorización agotada (HTTP ${error.status}). Rotando API Key...`);
            this.rotateApiKey(keys);
          }
        }

        if (attempt >= maxRetries) {
          throw new Error(`Se agotaron los ${maxRetries} reintentos en el modelo ${model}`);
        }

        // Backoff exponencial antes de reintentar
        await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
      }
    }

    throw new Error(`Fallo tras ${maxRetries} reintentos.`);
  }

  private getCurrentApiKey(keys: ReadonlyArray<string>): string {
    if (!keys || keys.length === 0) {
      throw new Error('No hay claves API de Google Gemini configuradas.');
    }
    return keys[this.currentKeyIndex % keys.length];
  }

  private rotateApiKey(keys: ReadonlyArray<string>): void {
    if (keys && keys.length > 1) {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % keys.length;
      console.info(`[OCR] API Key rotada al índice: ${this.currentKeyIndex}`);
    }
  }

  private buildGeminiPayload(base64Data: string, mimeType: string): object {
    return {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Sos un asistente contable y fiscal experto en comprobantes de Argentina (facturas A/B/C/M, tickets fiscales, recibos de combustible YPF/Shell/Axion, peajes, compras corporativas y remates).
Analizá minuciosamente el comprobante adjunto y extraé los campos en formato JSON estricto:
- razon_social: Nombre o razón social del emisor/proveedor.
- cuit: CUIT del emisor (11 dígitos, con o sin guiones).
- n_operacion: Número de comprobante o factura (ej: 0001-00012345).
- tipo_gasto: Clasificar en COMBUSTIBLE, COMIDA, TRANSPORTE, PERSONAL, PEAJES, ALOJAMIENTOS, SERVICIOS, LIBRERIA u OTROS.
- metodo_pago: Efectivo, Tarjeta de Crédito, Tarjeta de Débito o Transferencia.
- fecha: Fecha de emisión en formato YYYY-MM-DD.
- monto: Subtotal o importe neto gravado.
- iva: Importe del IVA.
- total: Importe final total del comprobante.
- items: Lista de productos o conceptos adquiridos.`
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            razon_social: { type: 'STRING' },
            cuit: { type: 'STRING' },
            n_operacion: { type: 'STRING' },
            tipo_gasto: {
              type: 'STRING',
              enum: ['COMBUSTIBLE', 'COMIDA', 'TRANSPORTE', 'PERSONAL', 'PEAJES', 'ALOJAMIENTOS', 'SERVICIOS', 'LIBRERIA', 'OTROS']
            },
            metodo_pago: {
              type: 'STRING',
              enum: ['Efectivo', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'Transferencia']
            },
            fecha: { type: 'STRING' },
            monto: { type: 'NUMBER' },
            iva: { type: 'NUMBER' },
            total: { type: 'NUMBER' },
            vendor: { type: 'STRING' },
            items: {
              type: 'ARRAY',
              items: { type: 'STRING' }
            }
          },
          required: ['total']
        }
      }
    };
  }

  private parseGeminiResponse(response: IGeminiGenerateContentResponse | undefined): IOCROriginalData {
    const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Respuesta vacía o formato inválido de Google Gemini');
    }

    try {
      const parsed = JSON.parse(rawText) as Record<string, unknown>;

      const total = typeof parsed['total'] === 'number' ? parsed['total'] : Number(parsed['total']) || 0;
      const iva = typeof parsed['iva'] === 'number' ? parsed['iva'] : Number(parsed['iva']) || 0;
      let monto = typeof parsed['monto'] === 'number' ? parsed['monto'] : Number(parsed['monto']) || 0;

      // Si monto neto no fue discriminado pero hay total e IVA, calcular neto
      if (!monto && total) {
        monto = Math.max(0, total - iva);
      }

      const ocrData: IOCROriginalData = {
        razon_social: typeof parsed['razon_social'] === 'string' ? parsed['razon_social'].trim() : '',
        cuit: typeof parsed['cuit'] === 'string' ? parsed['cuit'].trim() : '',
        n_operacion: typeof parsed['n_operacion'] === 'string' ? parsed['n_operacion'].trim() : '',
        tipo_gasto: typeof parsed['tipo_gasto'] === 'string' ? parsed['tipo_gasto'] : 'OTROS',
        metodo_pago: typeof parsed['metodo_pago'] === 'string' ? parsed['metodo_pago'] : 'Efectivo',
        fecha: typeof parsed['fecha'] === 'string' ? parsed['fecha'] : new Date().toISOString().split('T')[0],
        monto: monto,
        iva: iva,
        total: total,
        vendor: typeof parsed['vendor'] === 'string' ? parsed['vendor'].trim() : '',
        items: Array.isArray(parsed['items']) ? parsed['items'].map(String) : []
      };

      return ocrData;
    } catch (e) {
      throw new Error(`Error al parsear el JSON retornado por la IA: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  private fileToBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remover el encabezado data:image/xxx;base64,
        const base64Index = result.indexOf(';base64,');
        if (base64Index !== -1) {
          resolve(result.substring(base64Index + 8));
        } else {
          resolve(result);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}
