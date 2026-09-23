import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { OfflineStorageService, IOfflineStorageItem } from './offline-storage.service';
import { environment } from '../../../enviroments/enviroment';
import { ITicketSession, ITicketPayload, ITicket } from '../models/ticket.model';

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
    console.log(`Sincronizando ${items.length} rendiciones pendientes...`);

    for (const item of items) {
      try {
        // En este contexto, 'data' debería ser un ITicketPayload
        await this.http.post(this.apiUrl, item.data).pipe(
          retry({ count: 3, delay: 2000 })
        ).toPromise();
        
        await this.offlineStorage.deleteSession(item.id);
      } catch (err) {
        console.error('Error sincronizando sesión tras 3 reintentos:', item.id, err);
      }
    }

    this.isSyncing = false;
    console.log('Sincronización finalizada ✅');
  }

  syncSession(session: ITicketSession): Observable<any> {
    const payload = this.mapSessionToPayload(session);

    if (navigator.onLine) {
      return this.http.post(this.apiUrl, payload).pipe(
        retry({ count: 3, delay: 1000 })
      );
    } else {
      const offlineItem: IOfflineStorageItem = {
        id: `OFFLINE-${Date.now()}`,
        data: payload,
        timestamp: Date.now()
      };
      
      return from(this.offlineStorage.saveSession(offlineItem)).pipe(
        map(() => ({ status: 'saved_locally' })),
        catchError(err => throwError(() => new Error('Error al guardar localmente')))
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
        imagen_base64: t.preview || null, // Se envía la imagen para el validador
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
