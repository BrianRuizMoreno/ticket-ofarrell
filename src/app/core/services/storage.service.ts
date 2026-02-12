import { Injectable } from '@angular/core';
import { SessionData } from '../models/auth.model';
import { TicketSession, Ticket } from '../models/ticket.model';

interface StoredTicketSession extends Omit<TicketSession, 'tickets'> {
  readonly tickets: ReadonlyArray<Omit<Ticket, 'archivo'> & { readonly archivo: null }>;
}

interface QueueItem {
  readonly payload: unknown;
  readonly queuedAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly SESSION_KEY = 'physis_session';
  private readonly TICKET_SESSION_KEY = 'physis_ticket_session';
  private readonly OFFLINE_QUEUE_KEY = 'physis_offline_queue';

  saveSession(session: SessionData): void {
    try {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Error guardando sesión:', e);
    }
  }

  getSession(): SessionData | null {
    try {
      const data = sessionStorage.getItem(this.SESSION_KEY);
      if (!data) return null;
      return JSON.parse(data) as SessionData;
    } catch (e) {
      console.error('Error leyendo sesión:', e);
      return null;
    }
  }

  clearSession(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
  }

  isSessionValid(): boolean {
    const session = this.getSession();
    if (!session) return false;

    const now = Date.now();
    const sessionAge = now - session.timestamp;
    const maxAge = 24 * 60 * 60 * 1000;

    return sessionAge < maxAge;
  }

  saveTicketSession(session: TicketSession): void {
    try {
      const serializableSession: StoredTicketSession = {
        ...session,
        tickets: session.tickets.map(t => ({
          ...t,
          archivo: null
        }))
      };
      sessionStorage.setItem(this.TICKET_SESSION_KEY, JSON.stringify(serializableSession));
    } catch (e) {
      console.error('Error guardando ticket session:', e);
    }
  }

  getTicketSession(): TicketSession | null {
    try {
      const data = sessionStorage.getItem(this.TICKET_SESSION_KEY);
      if (!data) return null;
      return JSON.parse(data) as TicketSession;
    } catch (e) {
      console.error('Error leyendo ticket session:', e);
      return null;
    }
  }

  clearTicketSession(): void {
    sessionStorage.removeItem(this.TICKET_SESSION_KEY);
  }

  addToOfflineQueue(payload: unknown): void {
    try {
      const queue = this.getOfflineQueue();
      const newQueue: ReadonlyArray<QueueItem> = [
        ...queue,
        { payload, queuedAt: Date.now() }
      ];
      localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(newQueue));
    } catch (e) {
      console.error('Error agregando a cola:', e);
    }
  }

  getOfflineQueue(): ReadonlyArray<QueueItem> {
    try {
      const data = localStorage.getItem(this.OFFLINE_QUEUE_KEY);
      if (!data) return [];
      return JSON.parse(data) as QueueItem[];
    } catch (e) {
      return [];
    }
  }

  clearOfflineQueue(): void {
    localStorage.removeItem(this.OFFLINE_QUEUE_KEY);
  }

  removeFromQueue(index: number): void {
    const queue = this.getOfflineQueue();
    const newQueue = [...queue];
    newQueue.splice(index, 1);
    localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(newQueue));
  }
}