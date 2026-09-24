import { Injectable } from '@angular/core';
import { IRendicion } from '../../features/validador/services/rendiciones.service';

@Injectable({
  providedIn: 'root'
})
export class LocalDbService {
  private readonly dbName = 'ScannerValidatorDB';
  private readonly dbVersion = 1;
  private readonly dbReady: Promise<IDBDatabase>;

  constructor() {
    this.dbReady = this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB no está soportada en este entorno.'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('rendiciones')) {
          db.createObjectStore('rendiciones', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  /** Guarda una lista de rendiciones en la base de datos local */
  async guardarRendiciones(rendiciones: IRendicion[]): Promise<void> {
    try {
      const db = await this.dbReady;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['rendiciones'], 'readwrite');
        const store = transaction.objectStore('rendiciones');

        store.clear();
        rendiciones.forEach(r => store.put(r));

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (e) {
      console.warn('No se pudo guardar en IndexedDB:', e);
    }
  }

  /** Obtiene todas las rendiciones guardadas localmente */
  async obtenerRendiciones(): Promise<IRendicion[]> {
    try {
      const db = await this.dbReady;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['rendiciones'], 'readonly');
        const store = transaction.objectStore('rendiciones');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('No se pudo leer de IndexedDB:', e);
      return [];
    }
  }
}
