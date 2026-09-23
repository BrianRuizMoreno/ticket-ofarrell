import { Injectable } from '@angular/core';
import { IRendicion } from '../../features/validador/services/rendiciones.service';

@Injectable({
  providedIn: 'root'
})
export class LocalDbService {
  private dbName = 'ScannerValidatorDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB() {
    const request = indexedDB.open(this.dbName, this.dbVersion);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('rendiciones')) {
        db.createObjectStore('rendiciones', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event: Event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      console.log('IndexedDB inicializada correctamente');
    };

    request.onerror = (event: Event) => {
      console.error('Error al inicializar IndexedDB:', (event.target as IDBOpenDBRequest).error);
    };
  }

  /** Guarda una lista de rendiciones en la base de datos local */
  async guardarRendiciones(rendiciones: IRendicion[]): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['rendiciones'], 'readwrite');
      const store = transaction.objectStore('rendiciones');

      // Limpiamos el almacén antes de guardar la nueva lista para sincronizar borrados
      store.clear();
      rendiciones.forEach(r => store.put(r));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /** Obtiene todas las rendiciones guardadas localmente */
  async obtenerRendiciones(): Promise<IRendicion[]> {
    if (!this.db) {
        // Si no está inicializada aún, esperamos un poco
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!this.db) return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['rendiciones'], 'readonly');
      const store = transaction.objectStore('rendiciones');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
