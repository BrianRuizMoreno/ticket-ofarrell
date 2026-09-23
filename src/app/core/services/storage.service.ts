import { Injectable } from '@angular/core';
import { ISessionData } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly SESSION_KEY = 'physis_session';

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
}