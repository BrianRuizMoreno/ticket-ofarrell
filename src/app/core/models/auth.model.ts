export interface IEmpresa {
  readonly idEmpresa: string;
  readonly descripcion: string;
}

export interface IUsuario {
  readonly id1: string;
  readonly id2: string;
  readonly id3: string;
  readonly tipo: number;
  readonly username: string;
  readonly nombre: string;
  readonly numeroDocumento: string;
  readonly cambiarClave: boolean;
  readonly idUsuarioRelacionado: number;
}

export interface ICatalogo {
  readonly cliente: string;
  readonly catalog: string;
  readonly idSerial: string;
}

export interface IAuthResponse {
  readonly token: string;
  readonly refreshToken: string;
  readonly catalogo: ICatalogo;
  readonly empresa: IEmpresa | null;
  readonly usuario: IUsuario;
  readonly empresasDisponibles: readonly IEmpresa[] | null;
}

export interface ILoginRequest {
  readonly username: string;
  readonly password: string;
  readonly idSerial: string;
  readonly idEmpresa?: string;
}

export interface IEmpresaSelectRequest {
  readonly idEmpresa: string;
}

export interface ISessionData {
  readonly token: string;
  readonly refreshToken: string;
  readonly usuario: IUsuario;
  readonly empresa: IEmpresa;
  readonly catalogo: ICatalogo;
  readonly timestamp: number;
}

export type AuthStatus =
  | 'idle'
  | 'authenticating'
  | 'selecting_empresa'
  | 'authenticated'
  | 'error';

export interface IAuthError {
  readonly code: string;
  readonly message: string;
  readonly statusCode?: number;
}