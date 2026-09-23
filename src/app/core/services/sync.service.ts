import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, throwError, firstValueFrom } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { OfflineStorageService, IOfflineStorageItem } from './offline-storage.service';
import { environment } from '../../../enviroments/enviroment';
import { ITicketSession, ITicketPayload } from '../models/ticket.model';

export interface ISyncResponse {
  readonly success?: boolean;
  readonly status?: 'success' | 'saved_locally';
  readonly id?: string;
  readonly message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private readonly http = inject(HttpClient);
  private readonly offlineStorage = inject(OfflineStorageService);
  private readonly apiUrl = environment.saveWebhook;

  private isSyncing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.syncPendingTickets();
      });
    }
  }

  async syncPendingTickets(): Promise<void> {
    if (this.isSyncing) return;

    const items = await this.offlineStorage.getAllSessions();
    if (items.length === 0) return;

    this.isSyncing = true;

    for (const item of items) {
      try {
        await firstValueFrom(
          this.http.post<ISyncResponse>(this.apiUrl, item.data).pipe(
            retry({ count: 3, delay: 2000 })
          )
        );

        await this.offlineStorage.deleteSession(item.id);
      } catch (err) {
        console.error('Error sincronizando sesión tras 3 reintentos:', item.id, err);
      }
    }

    this.isSyncing = false;
  }

  syncSession(session: ITicketSession): Observable<ISyncResponse> {
    const payload = this.mapSessionToPayload(session);

    if (navigator.onLine) {
      return this.http.post<ISyncResponse>(this.apiUrl, payload).pipe(
        retry({ count: 3, delay: 1000 }),
        map((res: ISyncResponse) => ({
          ...res,
          status: 'success' as const
        }))
      );
    } else {
      const offlineItem: IOfflineStorageItem = {
        id: `OFFLINE-${Date.now()}`,
        data: payload,
        timestamp: Date.now()
      };

      return from(this.offlineStorage.saveSession(offlineItem)).pipe(
        map(() => ({ status: 'saved_locally' as const })),
        catchError(() => throwError(() => new Error('Error al guardar localmente en cola offline')))
      );
    }
  }

  private mapSessionToPayload(session: ITicketSession): ITicketPayload {
    const totalMonto = session.tickets.reduce((sum, t) => sum + t.datos_modificados.monto, 0);
    const totalIva = session.tickets.reduce((sum, t) => sum + t.datos_modificados.iva, 0);

    return {
      id: `R-${Date.now()}`,
      usuario: session.encargado,
      empresa: session.lugar !== 'OTRO' ? session.lugar : session.lugar_especifico,
      total: totalMonto,
      session: {
        encargado: session.encargado,
        lugar: session.lugar,
        lugar_especifico: session.lugar_especifico
      },
      tickets: session.tickets.map(t => ({
        id: t.id,
        archivo_nombre: t.archivo ? t.archivo.name : null,
        imagen_base64: t.preview || null,
        ocr_original: t.datos_ocr_original,
        modificado: t.datos_modificados
      })),
      totales: {
        monto: totalMonto,
        iva: totalIva
      }
    };
  }
}
