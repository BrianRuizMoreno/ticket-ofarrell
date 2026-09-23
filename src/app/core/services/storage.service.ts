import { Injectable } from '@angular/core';
import { ISessionData } from '../models/auth.model';
import { ITicketSession, ITicket } from '../models/ticket.model';

interface IStoredTicketSession extends Omit<ITicketSession, 'tickets'> {
  readonly tickets: ReadonlyArray<Omit<ITicket, 'archivo'> & { readonly archivo: null }>;
}

interface IQueueItem {
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

  saveSession(session: ISessionData): void {
    try {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Error guardando sesión:', e);
    }
  }

  getSession(): ISessionData | null {
    try {
      const data = sessionStorage.getItem(this.SESSION_KEY);
      if (!data) return null;
      return JSON.parse(data) as ISessionData;
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

  saveTicketSession(session: ITicketSession): void {
    try {
      const serializableSession: IStoredTicketSession = {
        ...session,
        tickets: session.tickets.map((t: ITicket) => ({
          ...t,
          archivo: null
        }))
      };
      localStorage.setItem(this.TICKET_SESSION_KEY, JSON.stringify(serializableSession));
    } catch (e) {
      console.error('Error guardando ticket session:', e);
    }
  }

  getTicketSession(): ITicketSession | null {
    try {
      const data = localStorage.getItem(this.TICKET_SESSION_KEY);
      if (!data) return null;
      return JSON.parse(data) as ITicketSession;
    } catch (e) {
      console.error('Error leyendo ticket session:', e);
      return null;
    }
  }

  clearTicketSession(): void {
    localStorage.removeItem(this.TICKET_SESSION_KEY);
  }

  addToOfflineQueue(payload: unknown): void {
    try {
      const queue = this.getOfflineQueue();
      const newQueue: ReadonlyArray<IQueueItem> = [
        ...queue,
        { payload, queuedAt: Date.now() }
      ];
      localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(newQueue));
    } catch (e) {
      console.error('Error agregando a cola:', e);
    }
  }

  getOfflineQueue(): ReadonlyArray<IQueueItem> {
    try {
      const data = localStorage.getItem(this.OFFLINE_QUEUE_KEY);
      if (!data) return [];
      return JSON.parse(data) as IQueueItem[];
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