import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { TicketSession, TicketPayload } from '../core/models/ticket.model';

@Injectable({
    providedIn: 'root'
})
export class SyncService {
    private readonly http = inject(HttpClient);
    private readonly webhookUrl = environment.saveWebhook;

    syncSession(session: TicketSession): Observable<unknown> {
        const formData = new FormData();

        formData.append('encargado', session.encargado);
        formData.append('lugar', session.lugar);
        formData.append('lugar_especifico', session.lugar_especifico);
        formData.append('cantidad_tickets', session.tickets.length.toString());
        formData.append('fecha_envio', new Date().toISOString());

        let totalMonto = 0;
        let totalIva = 0;

        session.tickets.forEach((t, i) => {
            totalMonto += t.datos_modificados.monto;
            totalIva += t.datos_modificados.iva;

            formData.append(`ticket[${i}][modificado]`, JSON.stringify(t.datos_modificados));
            formData.append(`ticket[${i}][ocr_original]`, JSON.stringify(t.datos_ocr_original));

            if (t.archivo) {
                formData.append(`ticket[${i}][archivo]`, t.archivo, t.archivo.name);
            }

            formData.append(`ticket[${i}][fue_modificado]`, t.fue_modificado ? 'SI' : 'NO');
        });

        formData.append('total_monto', totalMonto.toString());
        formData.append('total_iva', totalIva.toString());

        const payloadCompleto: TicketPayload = {
            session: {
                encargado: session.encargado,
                lugar: session.lugar,
                lugar_especifico: session.lugar_especifico
            },
            tickets: session.tickets.map(t => ({
                id: t.id,
                archivo_nombre: t.archivo ? t.archivo.name : null,
                ocr_original: t.datos_ocr_original,
                modificado: t.datos_modificados
            })),
            totales: {
                monto: totalMonto,
                iva: totalIva
            }
        };

        formData.append('payload_completo', JSON.stringify(payloadCompleto));

        return this.http.post(this.webhookUrl, formData).pipe(
            retry(3)
        );
    }
}
