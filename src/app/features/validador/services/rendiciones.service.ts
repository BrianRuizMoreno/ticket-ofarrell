import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviroments/enviroment';
import { ITicketModifiedData, IOCROriginalData } from '../../../core/models/ticket.model';

export interface IRendicion {
  id: string;
  usuario: string;
  empresa?: string;
  empresa_especifica?: string;
  fecha_recepcion?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
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

@Injectable({
  providedIn: 'root'
})
export class RendicionesService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/rendiciones';

  getRendiciones() {
    // Añadimos un "cache-buster" para evitar que el navegador nos devuelva una versión "fantasma"
    return this.http.get<IRendicion[]>(`${this.apiUrl}?t=${new Date().getTime()}`);
  }

  actualizarRendicion(rendicion: IRendicion) {
    return this.http.patch(`${this.apiUrl}/${rendicion.id}`, {
      estado: rendicion.estado,
      observaciones: rendicion.observaciones
    });
  }

  limpiarRendiciones() {
    return this.http.delete(`${this.apiUrl}/clear`);
  }

  eliminarRendicion(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
