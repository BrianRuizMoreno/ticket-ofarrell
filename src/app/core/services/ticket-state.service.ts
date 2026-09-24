import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  ITicket,
  ITicketSession,
  ITicketResumen,
  ILugarPredefinido,
  ITicketModifiedData,
  IOCROriginalData
} from '../models/ticket.model';
import { StorageService } from './storage.service';

interface ITicketState {
  readonly session: ITicketSession | null;
  readonly currentTicket: ITicket | null;
  readonly isProcessing: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TicketStateService {
  private readonly storage = inject(StorageService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly state = signal<ITicketState>({
    session: this.loadInitialSession(),
    currentTicket: null,
    isProcessing: false
  });

  private readonly onlineSignal = signal<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  readonly isOnline = computed(() => this.onlineSignal());

  constructor() {
    if (typeof window !== 'undefined') {
      fromEvent(window, 'online')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.onlineSignal.set(true));

      fromEvent(window, 'offline')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.onlineSignal.set(false));
    }
  }

  readonly session = computed(() => this.state().session);
  readonly currentTicket = computed(() => this.state().currentTicket);
  readonly isProcessing = computed(() => this.state().isProcessing);
  readonly hasSession = computed(() => this.state().session !== null);
  readonly tickets = computed(() => this.state().session?.tickets ?? []);
  readonly ticketsCount = computed(() => this.state().session?.tickets.length ?? 0);
  readonly totalMonto = computed(() => {
    const tickets = this.state().session?.tickets ?? [];
    return tickets.reduce((sum: number, t: ITicket) => sum + t.datos_modificados.monto, 0);
  });

  readonly ticketsResumen = computed((): ReadonlyArray<ITicketResumen> => {
    const tickets = this.state().session?.tickets ?? [];
    return tickets.map((t: ITicket): ITicketResumen => ({
      id: t.id,
      razon: t.datos_modificados.razon_social,
      tipo: t.datos_modificados.tipo_gasto,
      tipoEspecifico: t.datos_modificados.tipo_gasto_especifico,
      monto: t.datos_modificados.monto,
      fecha: t.datos_modificados.fecha,
      fueModificado: t.fue_modificado
    }));
  });

  private loadInitialSession(): ITicketSession | null {
    return this.storage.getTicketSession();
  }

  startSession(encargado: string, lugar: ILugarPredefinido, lugarEspecifico: string): void {
    const newSession: ITicketSession = {
      encargado,
      lugar,
      lugar_especifico: lugarEspecifico,
      tickets: [],
      fecha_inicio: new Date().toISOString()
    };

    this.state.update(s => ({ ...s, session: newSession }));
    this.saveSession(newSession);
  }

  private saveSession(session: ITicketSession): void {
    this.storage.saveTicketSession(session);
  }

  setProcessing(value: boolean): void {
    this.state.update((s: ITicketState) => ({ ...s, isProcessing: value }));
  }

  setCurrentTicket(ticket: ITicket | null): void {
    this.state.update((s: ITicketState) => ({ ...s, currentTicket: ticket }));
  }

  addTicket(ticket: ITicket): void {
    this.state.update((s: ITicketState) => {
      if (!s.session) return s;

      const updatedTickets: ReadonlyArray<ITicket> = [...s.session.tickets, ticket];
      const updatedSession: ITicketSession = {
        ...s.session,
        tickets: updatedTickets
      };

      return { ...s, session: updatedSession, currentTicket: null };
    });

    this.persistSession();
  }

  getTicketById(id: string): ITicket | undefined {
    return this.state().session?.tickets.find(t => t.id === id);
  }

  updateTicket(id: string, modifiedData: ITicketModifiedData): void {
    this.state.update((s: ITicketState) => {
      if (!s.session) return s;

      const updatedTickets = s.session.tickets.map((t: ITicket) => {
        if (t.id === id) {
          const fueModificado = this.checkIfModified(t.datos_ocr_original, modifiedData);
          return {
            ...t,
            datos_modificados: modifiedData,
            fue_modificado: fueModificado
          };
        }
        return t;
      });

      return { ...s, session: { ...s.session, tickets: updatedTickets } };
    });

    this.persistSession();
  }

  removeTicket(id: string): void {
    this.state.update((s: ITicketState) => {
      if (!s.session) return s;

      const updatedTickets = s.session.tickets.filter((t: ITicket) => t.id !== id);
      const updatedSession: ITicketSession = {
        ...s.session,
        tickets: updatedTickets
      };

      return { ...s, session: updatedSession };
    });

    this.persistSession();
  }

  clearSession(): void {
    this.state.set({
      session: null,
      currentTicket: null,
      isProcessing: false
    });
    this.storage.clearTicketSession();
  }

  private persistSession(): void {
    const session = this.state().session;
    if (session) {
      this.storage.saveTicketSession(session);
    }
  }

  createTicket(
    archivo: File | null,
    preview: string,
    ocrData: IOCROriginalData,
    modifiedData: ITicketModifiedData
  ): ITicket {
    const fueModificado = this.checkIfModified(ocrData, modifiedData);

    const safeUuid = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    return {
      id: `TICKET_${Date.now()}_${safeUuid}`,
      archivo,
      preview,
      datos_ocr_original: ocrData,
      datos_modificados: modifiedData,
      fue_modificado: fueModificado,
      timestamp: Date.now(),
      sync_status: 'pending'
    };
  }

  private checkIfModified(ocr: IOCROriginalData, modified: ITicketModifiedData): boolean {
    const ocrRazon = ocr.razon_social ?? ocr.vendor ?? '';
    const ocrMonto = ocr.monto ?? ocr.total ?? 0;

    return (
      ocrRazon !== modified.razon_social ||
      Math.abs(ocrMonto - modified.monto) > 0.01
    );
  }
}