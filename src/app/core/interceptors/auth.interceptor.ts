import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, catchError } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';
import { AuthService, SKIP_AUTH_TOKEN } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si la petición solicitó omitir el token mediante HttpContext, no modificamos
  if (req.context.get(SKIP_AUTH_TOKEN)) {
    return next(req);
  }

  // Solo adjuntamos el Bearer Token de Physis si la petición va dirigida a la API de Physis
  const isPhysisApi = req.url.startsWith(environment.apiUrl);
  const publicUrls: ReadonlyArray<string> = ['/core/auth'];
  const isPublicUrl = publicUrls.some((url: string) => req.url.includes(url));

  let modifiedReq = req;

  if (isPhysisApi && !isPublicUrl) {
    const token = authService.getToken();
    if (token) {
      modifiedReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Solo deslogueamos si el 401 proviene legítimamente de la API de autenticación de Physis
      if (error.status === 401 && isPhysisApi) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};