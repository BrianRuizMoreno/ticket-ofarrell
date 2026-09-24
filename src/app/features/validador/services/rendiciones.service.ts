import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviroments/enviroment';
import { ITicketModifiedData, IOCROriginalData } from '../../../core/models/ticket.model';

export interface IRendicion {
  id: string;
  usuario: string;
  empresa?: string;
  empresa_especifica?: string;
  fecha_recepcion?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'eliminada';
  total: number;
  cantidad_tickets?: number;
  observaciones?: string;
  tickets: IRendicionTicket[];
}

export interface IRendicionTicket {
  id: string;
  url_imagen?: string;
  imagen_base64?: string;
  ocr_original: IOCROriginalData;
  modificado: ITicketModifiedData;
}

export interface IRendicionActionResponse {
  readonly success: boolean;
  readonly message?: string;
  readonly rendicion?: IRendicion;
}

@Injectable({
  providedIn: 'root'
})
export class RendicionesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.rendicionesApiUrl || 'http://localhost:3000/api/rendiciones';

  getRendiciones(): Observable<IRendicion[]> {
    return this.http.get<IRendicion[]>(`${this.apiUrl}?t=${new Date().getTime()}`);
  }

  getRendicion(id: string): Observable<IRendicion> {
    return this.http.get<IRendicion>(`${this.apiUrl}/${id}`);
  }

  actualizarRendicion(rendicion: IRendicion): Observable<IRendicionActionResponse> {
    return this.http.patch<IRendicionActionResponse>(`${this.apiUrl}/${rendicion.id}`, {
      estado: rendicion.estado,
      observaciones: rendicion.observaciones
    });
  }

  limpiarRendiciones(): Observable<IRendicionActionResponse> {
    return this.http.delete<IRendicionActionResponse>(`${this.apiUrl}/clear`);
  }

  eliminarRendicion(id: string): Observable<IRendicionActionResponse> {
    return this.http.delete<IRendicionActionResponse>(`${this.apiUrl}/${id}`);
  }
}
