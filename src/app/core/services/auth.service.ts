import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpContext, HttpContextToken } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment';
import { StorageService } from './storage.service';
import { TicketStateService } from './ticket-state.service';
import {
  AuthResponse,
  LoginRequest,
  EmpresaSelectRequest,
  SessionData,
  Empresa,
  AuthStatus,
  AuthError,
  Usuario
} from '../models/auth.model';

export const SKIP_AUTH_TOKEN = new HttpContextToken<boolean>(() => false);
export const SKIP_AUTH_INTERCEPTOR = new HttpContext().set(SKIP_AUTH_TOKEN, true);

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly ticketState = inject(TicketStateService);
  private readonly router = inject(Router);
  private readonly API_URL = environment.apiUrl;
  private readonly SERIAL_ID = environment.serialId;
  private readonly statusSignal = signal<AuthStatus>('idle');
  private readonly userSignal = signal<SessionData | null>(this.loadInitialUser());
  private readonly empresasSignal = signal<ReadonlyArray<Empresa> | null>(null);
  private readonly errorSignal = signal<AuthError | null>(null);
  readonly status = computed(() => this.statusSignal());
  readonly currentUser = computed(() => this.userSignal());
  readonly empresasDisponibles = computed(() => this.empresasSignal());
  readonly error = computed(() => this.errorSignal());
  readonly isAuthenticated = computed(() => this.userSignal() !== null);
  readonly isClientUser = computed(() => this.userSignal()?.usuario?.tipo === 3);
  readonly userName = computed(() => {
    const u = this.userSignal()?.usuario;
    return u?.nombre || u?.username || '';
  });
  readonly requiresEmpresaSelection = computed(() =>
    this.statusSignal() === 'selecting_empresa'
  );

  constructor() {
    const session = this.storage.getSession();
    if (session && this.storage.isSessionValid()) {
      this.statusSignal.set('authenticated');
    } else if (session) {
      this.logout();
    }
  }

  private loadInitialUser(): SessionData | null {
    return this.storage.isSessionValid() ? this.storage.getSession() : null;
  }

  login(username: string, password: string): Observable<AuthResponse> {
    this.statusSignal.set('authenticating');
    this.errorSignal.set(null);

    const payload: LoginRequest = {
      username: username.trim(),
      password: password,
      idSerial: this.SERIAL_ID
    };

    return this.http.post<AuthResponse>(`${this.API_URL}/core/auth`, payload).pipe(
      tap((response: AuthResponse) => this.handleLoginResponse(response)),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private handleLoginResponse(response: AuthResponse): void {
    if (response.empresa) {
      this.completeAuthentication(response);
      this.statusSignal.set('authenticated');

      if (this.ticketState.hasSession()) {
        this.router.navigate(['/tickets/menu']);
      } else {
        this.router.navigate(['/session-config']);
      }
    } else if (response.empresasDisponibles && response.empresasDisponibles.length > 0) {
      this.empresasSignal.set(response.empresasDisponibles);
      this.statusSignal.set('selecting_empresa');

      const partialSession: SessionData = {
        token: response.token,
        refreshToken: response.refreshToken,
        usuario: response.usuario,
        empresa: { idEmpresa: '', descripcion: '' },
        catalogo: response.catalogo,
        timestamp: Date.now()
      };
      this.storage.saveSession(partialSession);
    } else {
      throw new Error('Usuario sin empresas habilitadas');
    }
  }

  selectEmpresa(idEmpresa: string): Observable<AuthResponse> {
    const currentSession = this.storage.getSession();

    if (!currentSession) {
      return throwError(() => new Error('No hay sesión activa'));
    }

    const payload: EmpresaSelectRequest = { idEmpresa };

    return this.http.patch<AuthResponse>(
      `${this.API_URL}/core/auth/empresa`,
      payload,
      {
        headers: { 'Authorization': `Bearer ${currentSession.token}` }
      }
    ).pipe(
      tap((response: AuthResponse) => {
        this.completeAuthentication(response);
        this.statusSignal.set('authenticated');
        this.empresasSignal.set(null);

        if (this.ticketState.hasSession()) {
          this.router.navigate(['/tickets/menu']);
        } else {
          this.router.navigate(['/session-config']);
        }
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private completeAuthentication(response: AuthResponse): void {
    if (!response.empresa) {
      throw new Error('Respuesta sin empresa válida');
    }

    const sessionData: SessionData = {
      token: response.token,
      refreshToken: response.refreshToken,
      usuario: response.usuario,
      empresa: response.empresa,
      catalogo: response.catalogo,
      timestamp: Date.now()
    };

    this.storage.saveSession(sessionData);
    this.userSignal.set(sessionData);
  }

  logout(): void {
    this.storage.clearSession();
    this.ticketState.clearSession();
    this.userSignal.set(null);
    this.empresasSignal.set(null);
    this.statusSignal.set('idle');
    this.errorSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.userSignal()?.token ?? null;
  }

  getNombreUsuario(): string {
    return this.userSignal()?.usuario?.nombre ?? '';
  }

  getEmpresaActual(): string {
    return this.userSignal()?.empresa?.descripcion ?? '';
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    let errorCode = 'UNKNOWN';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
      errorCode = 'CLIENT_ERROR';
    } else {
      switch (error.status) {
        case 401:
          errorMessage = 'Usuario o contraseña incorrectos';
          errorCode = 'INVALID_CREDENTIALS';
          break;
        case 403:
          errorMessage = 'Acceso denegado';
          errorCode = 'FORBIDDEN';
          break;
        case 404:
          errorMessage = 'Servicio no disponible';
          errorCode = 'SERVICE_UNAVAILABLE';
          break;
        case 0:
          errorMessage = 'Sin conexión a internet';
          errorCode = 'NO_CONNECTION';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
          errorCode = `HTTP_${error.status}`;
      }
    }

    const authError: AuthError = {
      code: errorCode,
      message: errorMessage,
      statusCode: error.status
    };

    this.errorSignal.set(authError);
    this.statusSignal.set('error');

    return throwError(() => new Error(errorMessage));
  }
}