import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { StorageService } from '../core/services/storage.service';
import {
    Ticket,
    TicketSession,
    TicketModifiedData,
    OCROriginalData,
    LugarPredefinido,
    TicketResumen
} from '../core/models/ticket.model';

@Injectable({
    providedIn: 'root'
})
export class TicketStateService {
    private readonly storage = inject(StorageService);

    // --- Estado Reactivo (Signals) ---

    private readonly sessionSignal = signal<TicketSession | null>(this.storage.getTicketSession());

    // --- Selectores Computados (Públicos) ---

    readonly session = computed(() => this.sessionSignal());

    readonly tickets = computed(() => this.sessionSignal()?.tickets ?? []);

    readonly ticketsCount = computed(() => this.tickets().length);

    readonly totalMonto = computed(() => {
        return this.tickets().reduce((acc, t) => acc + t.datos_modificados.monto, 0);
    });

    readonly hasTickets = computed(() => this.ticketsCount() > 0);

    readonly ticketsResumen = computed((): ReadonlyArray<TicketResumen> => {
        return this.tickets().map(t => ({
            id: t.id,
            razon: t.datos_modificados.razon_social || 'Sin Razón Social',
            tipo: t.datos_modificados.tipo_gasto,
            tipoEspecifico: t.datos_modificados.tipo_gasto_especifico,
            monto: t.datos_modificados.monto,
            fecha: t.datos_modificados.fecha,
            fueModificado: t.fue_modificado
        }));
    });

    constructor() {
        // Efecto: Guardar en localStorage cada vez que cambie la sesión
        effect(() => {
            const currentSession = this.sessionSignal();
            if (currentSession) {
                this.storage.saveTicketSession(currentSession);
            } else {
                this.storage.clearTicketSession();
            }
        });

        // Validar expiración de sesión
        const current = this.storage.getTicketSession();
        if (current) {
            const now = Date.now();
            const start = new Date(current.fecha_inicio).getTime();
            if (now - start > 24 * 60 * 60 * 1000) {
                this.clearSession();
            }
        }
    }

    // --- Acciones ---

    startSession(encargado: string, lugar: LugarPredefinido, lugarEspecifico: string = ''): void {
        const newSession: TicketSession = {
            encargado,
            lugar,
            lugar_especifico: lugarEspecifico,
            tickets: [],
            fecha_inicio: new Date().toISOString()
        };
        this.sessionSignal.set(newSession);
    }

    createTicket(
        file: File | null,
        preview: string,
        ocrData: OCROriginalData,
        modifiedData: TicketModifiedData
    ): Ticket {
        const fueModificado = this.checkIfModified(ocrData, modifiedData);

        return {
            id: crypto.randomUUID(),
            archivo: file,
            preview,
            datos_ocr_original: ocrData,
            datos_modificados: modifiedData,
            fue_modificado: fueModificado,
            timestamp: Date.now(),
            sync_status: 'pending'
        };
    }

    addTicket(ticket: Ticket): void {
        this.sessionSignal.update(session => {
            if (!session) return null;
            return {
                ...session,
                tickets: [...session.tickets, ticket]
            };
        });
    }

    removeTicket(ticketId: string): void {
        this.sessionSignal.update(session => {
            if (!session) return null;
            return {
                ...session,
                tickets: session.tickets.filter(t => t.id !== ticketId)
            };
        });
    }

    clearSession(): void {
        this.sessionSignal.set(null);
    }

    // --- Helpers Privados ---

    private checkIfModified(ocr: OCROriginalData, mod: TicketModifiedData): boolean {
        if (Object.keys(ocr).length === 0) return true;

        const ocrMonto = ocr.monto || ocr.total || 0;
        if (Math.abs(ocrMonto - mod.monto) > 0.01) return true;

        const ocrRazon = ocr.razon_social || ocr.vendor || '';
        if (ocrRazon.trim().toLowerCase() !== mod.razon_social.trim().toLowerCase()) return true;

        return false;
    }
}
