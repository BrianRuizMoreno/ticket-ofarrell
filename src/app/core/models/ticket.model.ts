import { JsonObject } from '../types/json.types';

export type TipoGasto =
  | 'COMBUSTIBLE'
  | 'COMIDA'
  | 'TRANSPORTE'
  | 'PERSONAL'
  | 'PEAJES'
  | 'ALOJAMIENTOS'
  | 'SERVICIOS'
  | 'LIBRERIA'
  | 'OTROS';

export type MetodoPago =
  | 'Efectivo'
  | 'Tarjeta de Crédito'
  | 'Tarjeta de Débito'
  | 'Transferencia';

export type ILugarPredefinido =
  | 'REMATE_FISICO'
  | 'REMATE_CABANA'
  | 'OFICINA'
  | 'CORPORATIVO'
  | 'OTRO';

export interface IOCROriginalData extends JsonObject {
  readonly razon_social?: string;
  readonly cuit?: string;
  readonly n_operacion?: string;
  readonly tipo_gasto?: string;
  readonly metodo_pago?: string;
  readonly fecha?: string;
  readonly monto?: number;
  readonly iva?: number;
  readonly total?: number;
  readonly vendor?: string;
  readonly empresa?: string;
  readonly ticket_number?: string;
  readonly numero?: string;
  readonly impuesto?: number;
  readonly items?: string[];
}

export interface ITicketModifiedData {
  razon_social: string;
  cuit: string;
  n_operacion: string;
  tipo_gasto: TipoGasto;
  tipo_gasto_especifico: string;
  metodo_pago: MetodoPago;
  fecha: string;
  monto: number;
  iva: number;
  observaciones: string;
}

export type SyncStatus = 'pending' | 'synced' | 'error' | 'syncing';