import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RendicionesService, IRendicion } from './rendiciones.service';
import { LocalDbService } from '../../../core/services/local-db.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ValidadorStateService {
  private rendicionesService = inject(RendicionesService);
  private localDb = inject(LocalDbService);
  private snackBar = inject(MatSnackBar);

  private readonly _rendiciones = signal<IRendicion[]>([]);
  readonly rendiciones = computed(() => this._rendiciones());
  
  private readonly _loading = signal<boolean>(false);
  readonly loading = computed(() => this._loading());

  private readonly _error = signal<string | null>(null);
  readonly error = computed(() => this._error());

  constructor() {
    this.cargarDesdeLocal();
  }

  async cargarDesdeLocal() {
    const localData = await this.localDb.obtenerRendiciones();
    if (localData && localData.length > 0) {
      this._rendiciones.set(localData);
    }
  }

  cargarRendiciones() {
    this._loading.set(true);
    this.rendicionesService.getRendiciones().subscribe({
      next: async (data: IRendicion[]) => {
        const list = data.map((r: IRendicion) => ({
          ...r,
          empresa: r.empresa || 'Empresa No Def.',
          cantidad_tickets: r.cantidad_tickets || r.tickets?.length || 0,
          fecha_recepcion: r.fecha_recepcion || new Date().toISOString()
        }));
        
        this._rendiciones.set(list);
        await this.localDb.guardarRendiciones(list);
        this._loading.set(false);
      },
      error: (err: Error) => {
        this._error.set(err.message);
        this._loading.set(false);
      }
    });
  }

  seleccionarRendicion(id: string): IRendicion | undefined {
    return this._rendiciones().find((r: IRendicion) => r.id === id);
  }

  limpiarTodo() {
    this._loading.set(true);
    this.rendicionesService.limpiarRendiciones().subscribe({
      next: async () => {
        this._rendiciones.set([]);
        await this.localDb.guardarRendiciones([]);
        this._loading.set(false);
      },
      error: (err: Error) => {
        this._error.set(err.message);
        this._loading.set(false);
      }
    });
  }

  eliminarRendicion(id: string) {
    this._loading.set(true);
    this.rendicionesService.eliminarRendicion(id).subscribe({
      next: async () => {
        const current = this._rendiciones();
        const updated = current.filter(r => r.id !== id);
        this._rendiciones.set(updated);
        await this.localDb.guardarRendiciones(updated);
        this._loading.set(false);
        this.snackBar.open('Rendición eliminada con éxito', 'Cerrar', { duration: 3000 });
      },
      error: async (err: any) => {
        // Si el error es 404, significa que ya se borró en el servidor (o se reinició)
        // Por lo tanto, debemos borrarlo localmente para que no quede atascado.
        if (err instanceof HttpErrorResponse && err.status === 404) {
          const current = this._rendiciones();
          const updated = current.filter(r => r.id !== id);
          this._rendiciones.set(updated);
          await this.localDb.guardarRendiciones(updated);
          this._loading.set(false);
          this.snackBar.open('Rendición eliminada localmente (no se encontró en el servidor)', 'Cerrar', { duration: 3000 });
        } else {
          this._error.set(err.message);
          this._loading.set(false);
          this.snackBar.open('Error al eliminar la rendición: ' + err.message, 'Cerrar', { duration: 5000 });
        }
      }
    });
  }
}
