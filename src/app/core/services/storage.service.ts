import { Injectable } from '@angular/core';
import { ISessionData } from '../models/auth.model';
import { ITicketSession, ITicket } from '../models/ticket.model';

interface IStoredTicketSession extends Omit<ITicketSession, 'tickets'> {
  readonly tickets: ReadonlyArray<Omit<ITicket, 'archivo'> & { readonly archivo: null }>;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly SESSION_KEY = 'physis_session';
  private readonly TICKET_SESSION_KEY = 'physis_ticket_session';

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
      const parsed = JSON.parse(data) as unknown;
      if (parsed && typeof parsed === 'object' && 'token' in parsed) {
        return parsed as ISessionData;
      }
      return null;
    } catch (e) {
      console.warn('Error leyendo sesión:', e);
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
    const serializableSession: IStoredTicketSession = {
      ...session,
      tickets: session.tickets.map((t: ITicket) => ({
        ...t,
        archivo: null
      }))
    };

    try {
      localStorage.setItem(this.TICKET_SESSION_KEY, JSON.stringify(serializableSession));
    } catch (e: unknown) {
      console.warn('Error guardando ticket session en localStorage (posible cuota excedida). Intentando versión sin preview...', e);
      try {
        // En caso de cuota excedida, guardamos los metadatos sin la imagen base64 pesada
        const lightweightSession: IStoredTicketSession = {
          ...serializableSession,
          tickets: serializableSession.tickets.map(t => ({
            ...t,
            preview: ''
          }))
        };
        localStorage.setItem(this.TICKET_SESSION_KEY, JSON.stringify(lightweightSession));
      } catch (innerError) {
        console.error('No se pudo guardar la sesión de tickets en localStorage:', innerError);
      }
    }
  }

  getTicketSession(): ITicketSession | null {
    try {
      const data = localStorage.getItem(this.TICKET_SESSION_KEY);
      if (!data) return null;
      return JSON.parse(data) as ITicketSession;
    } catch (e) {
      console.warn('Error leyendo ticket session:', e);
      return null;
    }
  }

  clearTicketSession(): void {
    localStorage.removeItem(this.TICKET_SESSION_KEY);
  }
}