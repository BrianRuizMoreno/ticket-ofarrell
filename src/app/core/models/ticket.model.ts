import { JsonObject, JsonValue } from '../types/json.types';

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

export interface ITicket {
  readonly id: string;
  readonly archivo: File | null;
  readonly preview: string;
  readonly datos_modificados: ITicketModifiedData;
  readonly datos_ocr_original: IOCROriginalData;
  readonly fue_modificado: boolean;
  readonly timestamp: number;
  readonly sync_status: SyncStatus;
}

export interface ITicketSession {
  readonly encargado: string;
  readonly lugar: ILugarPredefinido;
  readonly lugar_especifico: string;
  readonly tickets: ReadonlyArray<ITicket>;
  readonly fecha_inicio: string;
}

export interface ITicketPayload {
  readonly id?: string;
  readonly usuario?: string;
  readonly empresa?: string;
  readonly total?: number;
  readonly session: {
    readonly encargado: string;
    readonly lugar: string;
    readonly lugar_especifico: string;
  };
  readonly tickets: ReadonlyArray<{
    readonly id: string;
    readonly archivo_nombre: string | null;
    readonly imagen_base64?: string | null;
    readonly ocr_original: IOCROriginalData;
    readonly modificado: ITicketModifiedData;
  }>;
  readonly totales: {
    readonly monto: number;
    readonly iva: number;
  };
}

export interface ITicketResumen {
  readonly id: string;
  readonly razon: string;
  readonly tipo: TipoGasto;
  readonly tipoEspecifico: string;
  readonly monto: number;
  readonly fecha: string;
  readonly fueModificado: boolean;
}