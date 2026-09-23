import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRippleModule } from '@angular/material/core';

import { TicketStateService } from '../../../../core/services/ticket-state.service';
import { SyncService } from '../../../../core/services/sync.service';
import { ILugarPredefinido } from '../../../../core/models/ticket.model';

@Component({
  selector: 'app-confirm',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatRippleModule
  ],
  template: `
    <div class="confirm-container">
      @if (!isOnline()) {
        <div class="offline-banner">
          <mat-icon>wifi_off</mat-icon>
          <span>Sin conexión — los tickets se guardan localmente</span>
        </div>
      }

      <h2 class="page-title">Resumen Final</h2>
      <p class="page-subtitle">Se enviará: Original + Modificado</p>

      <!-- Info Card -->
      <mat-card class="info-card">
        <div class="info-row">
          <span class="label">Encargado:</span>
          <span class="value">{{ encargado() }}</span>
        </div>
        <div class="info-row">
          <span class="label">Lugar:</span>
          <span class="value">{{ lugarDisplay() }}</span>
        </div>
        <div class="info-row">
          <span class="label">Tickets:</span>
          <span class="value">{{ ticketsCount() }}</span>
        </div>
        <mat-divider></mat-divider>
        <div class="total-row">
          <span class="total-label">TOTAL:</span>
          <span class="total-value">
            {{ totalMonto() | currency:'ARS':'symbol':'1.2-2' }}
          </span>
        </div>
      </mat-card>

      <!-- Lista Tickets -->
      <div class="tickets-list">
        <h3 class="list-title">Detalle de Tickets</h3>
        
        @for (ticket of ticketsResumen(); track ticket.id; let i = $index) {
          <mat-card class="ticket-card" (click)="editarTicket(ticket.id)" matRipple>
            <div class="ticket-header">
              <span class="ticket-number">{{ i + 1 }}.</span>
              <span class="ticket-razon">{{ ticket.razon }}</span>
              @if (ticket.fueModificado) {
                <span class="edited-tag">Editado</span>
              }
            </div>
            <div class="ticket-details">
              {{ ticket.tipo }}
              @if (ticket.tipo === 'OTROS') {
                - {{ ticket.tipoEspecifico }}
              }
              | {{ ticket.fecha | date:'dd/MM/yyyy' }}
            </div>
            <div class="ticket-amount">
              {{ ticket.monto | currency:'ARS':'symbol':'1.2-2' }}
            </div>
          </mat-card>
        }
      </div>

      <!-- Actions -->
      <div class="actions">
        <button 
          mat-raised-button 
          class="send-button"
          [disabled]="isSending() || ticketsCount() === 0"
          (click)="enviar()"
        >
          @if (isSending()) {
            <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
            <span>Enviando...</span>
          } @else {
            <ng-container>
              <mat-icon>send</mat-icon>
              <span> Enviar Todo</span>
            </ng-container>
          }
        </button>

        <button 
          mat-button 
          class="back-button"
          [disabled]="isSending()"
          (click)="volver()"
        >
          ← Volver al menú
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-container {
      min-height: 100vh;
      background: #f5f5f5;
      padding: 16px;
      padding-bottom: 140px;
    }

    .page-title {
      color: #003366;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .page-subtitle {
      color: #666;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .offline-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: #ff9800;
      color: white;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 16px;
      font-size: 13px;
      font-weight: 600;
    }

    .offline-banner mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .info-card {
      padding: 16px;
      margin-bottom: 16px;
      background: linear-gradient(135deg, #e3f2fd 0%, #f0f9ff 100%);
      border-left: 4px solid #003366;
      border-radius: 12px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .label {
      color: #666;
    }

    .value {
      color: #003366;
      font-weight: 600;
    }

    mat-divider {
      margin: 12px 0;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .total-label {
      color: #003366;
      font-weight: bold;
      font-size: 16px;
    }

    .total-value {
      color: #27c24c;
      font-size: 24px;
      font-weight: bold;
    }

    .tickets-list {
      margin-bottom: 16px;
    }

    .list-title {
      font-size: 14px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .ticket-card {
      padding: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      margin-bottom: 8px;
      border-radius: 12px;
    }

    .ticket-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      border-color: #27c24c;
    }

    .ticket-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .ticket-number {
      color: #003366;
      font-weight: bold;
    }

    .ticket-razon {
      color: #003366;
      font-weight: 600;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .edited-tag {
      background: #ff9800;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .ticket-details {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .ticket-amount {
      color: #27c24c;
      font-weight: bold;
      text-align: right;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16px;
      padding-bottom: max(16px, env(safe-area-inset-bottom) + 8px);
      background: linear-gradient(to top, rgba(245,245,245,1) 80%, rgba(245,245,245,0) 100%);
      z-index: 100;
      box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .send-button {
      height: 56px;
      font-size: 16px;
      font-weight: bold;
      text-transform: uppercase;
      background-color: #27c24c !important;
      color: white !important;
      border: none;
      border-radius: 12px;
      cursor: pointer;
    }

    .send-button ::ng-deep .mdc-button__label {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      height: 100%;
      line-height: 1;
    }

    .send-button mat-icon {
      margin: 0 !important;
      display: flex !important;
      align-items: center;
      justify-content: center;
      transform: translateY(-1px);
    }

    .send-button:hover:not(:disabled) {
      background-color: #22a53f !important;
    }

    .back-button {
      height: 48px;
      color: #666;
      background: none;
      border: none;
      cursor: pointer;
    }

    .inline-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class ConfirmPage {
  private readonly router = inject(Router);
  private readonly ticketState = inject(TicketStateService);
  private readonly syncService = inject(SyncService);
  private readonly snackBar = inject(MatSnackBar);

  readonly isSending = signal<boolean>(false);
  readonly isOnline = computed(() => this.ticketState.isOnline());

  readonly encargado = computed(() => this.ticketState.session()?.encargado ?? '');
  readonly lugar = computed(() => this.ticketState.session()?.lugar ?? 'OFICINA' as ILugarPredefinido);
  readonly lugarEspecifico = computed(() => this.ticketState.session()?.lugar_especifico ?? '');
  readonly ticketsCount = computed(() => this.ticketState.ticketsCount());
  readonly totalMonto = computed(() => this.ticketState.totalMonto());
  readonly ticketsResumen = computed(() => this.ticketState.ticketsResumen());

  readonly lugarDisplay = computed((): string => {
    const lugares: Record<ILugarPredefinido, string> = {
      'REMATE_FISICO': 'Remate Físico',
      'REMATE_CABANA': 'Remate Cabaña',
      'OFICINA': 'Oficina',
      'CORPORATIVO': 'Corporativo',
      'OTRO': this.lugarEspecifico()
    };
    return lugares[this.lugar()] ?? this.lugar();
  });

  editarTicket(id: string): void {
    this.router.navigate(['/tickets/form'], { state: { editId: id } });
  }

  volver(): void {
    this.router.navigate(['/tickets/menu']);
  }

  enviar(): void {
    const session = this.ticketState.session();
    if (!session || session.tickets.length === 0) return;

    this.isSending.set(true);

    this.syncService.syncSession(session).subscribe({
      next: () => {
        this.isSending.set(false);
        this.router.navigate(['/tickets/success']);
      },
      error: (err: Error) => {
        console.error('Error enviando tickets:', err);
        this.isSending.set(false);
        this.snackBar.open('Error al enviar los tickets. Intente nuevamente.', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
