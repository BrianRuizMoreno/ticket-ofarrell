import { Injectable, signal, computed, inject } from '@angular/core';

import {
  Ticket,
  TicketSession,
  TicketResumen,
  LugarPredefinido,
  TicketModifiedData,
  OCROriginalData
} from '../models/ticket.model';
import { StorageService } from './storage.service';

interface TicketState {
  readonly session: TicketSession | null;
  readonly currentTicket: Ticket | null;
  readonly isProcessing: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TicketStateService {
  private readonly storage = inject(StorageService);

  private readonly state = signal<TicketState>({
    session: this.loadInitialSession(),
    currentTicket: null,
    isProcessing: false
  });

  readonly session = computed(() => this.state().session);
  readonly currentTicket = computed(() => this.state().currentTicket);
  readonly isProcessing = computed(() => this.state().isProcessing);
  readonly hasSession = computed(() => this.state().session !== null);
  readonly tickets = computed(() => this.state().session?.tickets ?? []);
  readonly ticketsCount = computed(() => this.state().session?.tickets.length ?? 0);
  readonly totalMonto = computed(() => {
    const tickets = this.state().session?.tickets ?? [];
    return tickets.reduce((sum: number, t: Ticket) => sum + t.datos_modificados.monto, 0);
  });

  readonly ticketsResumen = computed((): ReadonlyArray<TicketResumen> => {
    const tickets = this.state().session?.tickets ?? [];
    return tickets.map((t: Ticket): TicketResumen => ({
      id: t.id,
      razon: t.datos_modificados.razon_social,
      tipo: t.datos_modificados.tipo_gasto,
      tipoEspecifico: t.datos_modificados.tipo_gasto_especifico,
      monto: t.datos_modificados.monto,
      fecha: t.datos_modificados.fecha,
      fueModificado: t.fue_modificado
    }));
  });

  private loadInitialSession(): TicketSession | null {
    return this.storage.getTicketSession();
  }

  startSession(encargado: string, lugar: LugarPredefinido, lugarEspecifico: string): void {
    const newSession: TicketSession = {
      encargado,
      lugar,
      lugar_especifico: lugarEspecifico,
      tickets: [],
      fecha_inicio: new Date().toISOString()
    };

    this.state.update(s => ({ ...s, session: newSession }));
    this.saveSession(newSession);
  }

  private saveSession(session: TicketSession): void {
    this.storage.saveTicketSession(session);
  }

  setProcessing(value: boolean): void {
    this.state.update((s: TicketState) => ({ ...s, isProcessing: value }));
  }

  setCurrentTicket(ticket: Ticket | null): void {
    this.state.update((s: TicketState) => ({ ...s, currentTicket: ticket }));
  }

  addTicket(ticket: Ticket): void {
    this.state.update((s: TicketState) => {
      if (!s.session) return s;

      const updatedTickets: ReadonlyArray<Ticket> = [...s.session.tickets, ticket];
      const updatedSession: TicketSession = {
        ...s.session,
        tickets: updatedTickets
      };

      return { ...s, session: updatedSession, currentTicket: null };
    });

    this.persistSession();
  }

  removeTicket(id: string): void {
    this.state.update((s: TicketState) => {
      if (!s.session) return s;

      const updatedTickets = s.session.tickets.filter((t: Ticket) => t.id !== id);
      const updatedSession: TicketSession = {
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
    ocrData: OCROriginalData,
    modifiedData: TicketModifiedData
  ): Ticket {
    const fueModificado = this.checkIfModified(ocrData, modifiedData);

    return {
      id: `TICKET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      archivo,
      preview,
      datos_ocr_original: ocrData,
      datos_modificados: modifiedData,
      fue_modificado: fueModificado,
      timestamp: Date.now(),
      sync_status: 'pending'
    };
  }

  private checkIfModified(ocr: OCROriginalData, modified: TicketModifiedData): boolean {
    const ocrRazon = ocr.razon_social ?? ocr.vendor ?? '';
    const ocrMonto = ocr.monto ?? ocr.total ?? 0;

    return (
      ocrRazon !== modified.razon_social ||
      Math.abs(ocrMonto - modified.monto) > 0.01
    );
  }
}