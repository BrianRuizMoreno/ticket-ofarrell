export interface Empresa {
  readonly idEmpresa: string;
  readonly descripcion: string;
}

export interface Usuario {
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

export interface Catalogo {
  readonly cliente: string;
  readonly catalog: string;
  readonly idSerial: string;
}

export interface AuthResponse {
  readonly token: string;
  readonly refreshToken: string;
  readonly catalogo: Catalogo;
  readonly empresa: Empresa | null;
  readonly usuario: Usuario;
  readonly empresasDisponibles: readonly Empresa[] | null;
}

export interface LoginRequest {
  readonly username: string;
  readonly password: string;
  readonly idSerial: string;
  readonly idEmpresa?: string;
}

export interface EmpresaSelectRequest {
  readonly idEmpresa: string;
}

export interface SessionData {
  readonly token: string;
  readonly refreshToken: string;
  readonly usuario: Usuario;
  readonly empresa: Empresa;
  readonly catalogo: Catalogo;
  readonly timestamp: number;
}

export type AuthStatus =
  | 'idle'
  | 'authenticating'
  | 'selecting_empresa'
  | 'authenticated'
  | 'error';

export interface AuthError {
  readonly code: string;
  readonly message: string;
  readonly statusCode?: number;
}