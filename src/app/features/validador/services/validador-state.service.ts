import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RendicionesService, IRendicion } from './rendiciones.service';
import { LocalDbService } from '../../../core/services/local-db.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ValidadorStateService {
  private readonly rendicionesService = inject(RendicionesService);
  private readonly localDb = inject(LocalDbService);
  private readonly snackBar = inject(MatSnackBar);

  private readonly _rendiciones = signal<IRendicion[]>([]);
  readonly rendiciones = computed(() => this._rendiciones());
  
  private readonly _loading = signal<boolean>(false);
  readonly loading = computed(() => this._loading());

  private readonly _error = signal<string | null>(null);
  readonly error = computed(() => this._error());

  constructor() {
    void this.cargarDesdeLocal();
  }

  async cargarDesdeLocal(): Promise<IRendicion[]> {
    const localData = await this.localDb.obtenerRendiciones();
    if (localData && localData.length > 0) {
      this._rendiciones.set(localData);
    }
    return localData;
  }

  cargarRendiciones(): void {
    this._loading.set(true);
    this.rendicionesService.getRendiciones().subscribe({
      next: async (data: IRendicion[]) => {
        try {
          const list = data.map((r: IRendicion) => ({
            ...r,
            empresa: r.empresa || 'Empresa No Def.',
            cantidad_tickets: r.cantidad_tickets || r.tickets?.length || 0,
            fecha_recepcion: r.fecha_recepcion || new Date().toISOString()
          }));
          
          this._rendiciones.set(list);
          await this.localDb.guardarRendiciones(list);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error al persistir rendiciones localmente';
          this._error.set(msg);
        } finally {
          this._loading.set(false);
        }
      },
      error: (err: HttpErrorResponse | Error) => {
        const msg = err instanceof HttpErrorResponse ? `Error HTTP ${err.status}: ${err.message}` : err.message;
        this._error.set(msg);
        this._loading.set(false);
      }
    });
  }

  seleccionarRendicion(id: string): IRendicion | undefined {
    return this._rendiciones().find((r: IRendicion) => r.id === id);
  }

  limpiarTodo(): void {
    this._loading.set(true);
    this.rendicionesService.limpiarRendiciones().subscribe({
      next: async () => {
        try {
          this._rendiciones.set([]);
          await this.localDb.guardarRendiciones([]);
        } finally {
          this._loading.set(false);
        }
      },
      error: (err: HttpErrorResponse | Error) => {
        this._error.set(err.message);
        this._loading.set(false);
      }
    });
  }

  eliminarRendicion(id: string): void {
    this._loading.set(true);
    this.rendicionesService.eliminarRendicion(id).subscribe({
      next: async () => {
        try {
          const current = this._rendiciones();
          const updated = current.filter(r => r.id !== id);
          this._rendiciones.set(updated);
          await this.localDb.guardarRendiciones(updated);
          this.snackBar.open('Rendición eliminada con éxito', 'Cerrar', { duration: 3000 });
        } finally {
          this._loading.set(false);
        }
      },
      error: async (err: HttpErrorResponse | Error) => {
        try {
          if (err instanceof HttpErrorResponse && err.status === 404) {
            const current = this._rendiciones();
            const updated = current.filter(r => r.id !== id);
            this._rendiciones.set(updated);
            await this.localDb.guardarRendiciones(updated);
            this.snackBar.open('Rendición eliminada localmente (no se encontró en el servidor)', 'Cerrar', { duration: 3000 });
          } else {
            this._error.set(err.message);
            this.snackBar.open('Error al eliminar la rendición: ' + err.message, 'Cerrar', { duration: 5000 });
          }
        } finally {
          this._loading.set(false);
        }
      }
    });
  }
}
