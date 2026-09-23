import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';

import { AuthService } from '../../../../core/services/auth.service';
import { TicketStateService } from '../../../../core/services/ticket-state.service';
import { ILugarPredefinido } from '../../../../core/models/ticket.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatListModule,
    MatDividerModule,
    MatRippleModule
  ],
  template: `
    <div class="menu-container">
      <!-- Network Status Banner -->
      @if (!isOnline()) {
        <div class="offline-banner">
          <mat-icon>wifi_off</mat-icon>
          <span>Sin conexión — los tickets se guardan localmente</span>
        </div>
      }

      <!-- Welcome Message -->
      <div class="welcome-banner" style="position: relative;">
        <h2>¡Hola <strong>{{ userName() }}</strong>!</h2>
        <p>Bienvenido al cargador de tickets.</p>
        <div class="network-status" [class.offline]="!isOnline()"></div>
      </div>

      <!-- Header Info -->
      <div class="session-info">
        <mat-card class="info-card">
          <div class="info-row">
            <mat-icon>person</mat-icon>
            <span class="info-label">Encargado:</span>
            <span class="info-value">{{ encargado() }}</span>
          </div>
          <div class="info-row">
            <mat-icon>place</mat-icon>
            <span class="info-label">Lugar:</span>
            <span class="info-value">{{ lugarDisplay() }}</span>
          </div>
          <div class="info-row">
            <mat-icon>business</mat-icon>
            <span class="info-label">Empresa:</span>
            <span class="info-value">{{ empresa() }}</span>
          </div>
        </mat-card>
      </div>

      <!-- Lista de Tickets -->
      @if (ticketsCount() > 0) {
        <div class="tickets-section">
          <h3 class="section-title">
            Tickets Acumulados
            <span class="badge">{{ ticketsCount() }}</span>
          </h3>
          
          <mat-card class="tickets-list">
            @for (ticket of ticketsResumen(); track ticket.id) {
              <div class="ticket-item" (click)="editarTicket(ticket.id)" matRipple>
                <div class="ticket-info">
                  <div class="ticket-header">
                    <span class="ticket-number">{{ $index + 1 }}.</span>
                    <span class="ticket-razon">{{ ticket.razon }}</span>
                    @if (ticket.fueModificado) {
                      <span class="edited-badge">Editado</span>
                    }
                  </div>
                  <div class="ticket-meta">
                    {{ ticket.tipo }}
                    @if (ticket.tipo === 'OTROS') {
                      - {{ ticket.tipoEspecifico }}
                    }
                    | {{ ticket.fecha | date:'dd/MM/yyyy' }}
                  </div>
                </div>
                <div class="ticket-end">
                  <div class="ticket-monto">
                    {{ ticket.monto | currency:'ARS':'symbol':'1.2-2' }}
                  </div>
                  <button mat-icon-button class="delete-button" (click)="borrarTicket($event, ticket.id)">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </div>
              </div>
              @if (!$last) {
                <mat-divider></mat-divider>
              }
            }
            
            <div class="total-row">
              <span>Total Acumulado:</span>
              <span class="total-amount">
                {{ totalMonto() | currency:'ARS':'symbol':'1.2-2' }}
              </span>
            </div>
          </mat-card>
        </div>
      }

      <!-- Acciones Principales -->
      <div class="actions-section">
        <input 
          type="file" 
          #fileInput
          accept="image/*" 
          capture="environment"
          class="hidden-input"
          (change)="onFileSelected($event)"
        />
        
        <button 
          mat-raised-button 
          class="scan-button"
          (click)="fileInput.click()"
        >
          <mat-icon>camera_alt</mat-icon>
          <div class="button-content">
            <span class="button-title">Escanear Ticket</span>
            <span class="button-subtitle">Tomar foto o seleccionar</span>
          </div>
        </button>

        <button 
          mat-raised-button 
          class="finish-button"
          [disabled]="ticketsCount() === 0"
          [class.disabled]="ticketsCount() === 0"
          (click)="finalizar()"
        >
          <mat-icon>check_circle</mat-icon>
          <div class="button-content">
            <span class="button-title">Finalizar y Enviar</span>
            <span class="button-subtitle">({{ ticketsCount() }} tickets)</span>
          </div>
        </button>
      </div>

      <!-- Cerrar Sesión -->
      <button 
        mat-button 
        class="logout-button"
        (click)="logout()"
      >
        <mat-icon>logout</mat-icon>
        Cerrar Sesión
      </button>
    </div>
  `,
  styles: [`
    .menu-container {
      min-height: 100vh;
      background-color: #f5f5f5;
      padding: 16px;
      padding-top: max(16px, env(safe-area-inset-top) + 16px);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .welcome-banner {
      color: #003366;
      margin-top: 4px;
      margin-bottom: 8px;
    }
    .welcome-banner h2 {
      font-size: 20px;
      margin: 0;
      font-weight: 400;
    }
    .welcome-banner p {
      font-size: 14px;
      margin: 2px 0 0 0;
      color: #666;
    }

    .network-status {
      position: absolute;
      top: 0.5rem;
      right: 0;
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 9999px;
      background-color: #22c55e;
      border: 2px solid white;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      transition: background-color 0.3s ease;
    }

    .network-status.offline {
      background-color: #ef4444;
    }

    .session-info {
      margin-top: 8px;
    }

    .info-card {
      padding: 16px;
      background: linear-gradient(135deg, #e3f2fd 0%, #f0f9ff 100%);
      border-left: 4px solid #003366;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .info-row:last-child {
      margin-bottom: 0;
    }

    .info-row mat-icon {
      color: #003366;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .info-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      font-weight: 500;
      min-width: 70px;
    }

    .info-value {
      font-size: 14px;
      color: #003366;
      font-weight: 600;
    }

    .tickets-section {
      margin-top: 8px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 12px;
      padding: 0 4px;
    }

    .badge {
      background-color: #003366;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
    }

    .tickets-list {
      padding: 0;
      overflow: hidden;
    }

    .ticket-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      gap: 12px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .ticket-item:hover {
      background-color: rgba(0, 51, 102, 0.05);
    }

    .ticket-info {
      flex: 1;
      min-width: 0;
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
      min-width: 24px;
    }

    .ticket-razon {
      color: #003366;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .edited-badge {
      background-color: #ff9800;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .ticket-meta {
      font-size: 12px;
      color: #666;
    }

    .ticket-end {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ticket-monto {
      color: #27c24c;
      font-weight: bold;
      font-size: 14px;
      white-space: nowrap;
    }

    .delete-button {
      color: #f44336;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background-color: #f0f9ff;
      border-top: 2px solid #55c1e6;
      font-weight: 600;
      color: #003366;
    }

    .total-amount {
      color: #27c24c;
      font-size: 18px;
    }

    .actions-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: auto;
    }

    .hidden-input {
      display: none;
    }

    .scan-button, .finish-button {
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 16px;
      border-radius: 16px;
      padding: 0 24px;
      border: none;
      cursor: pointer;
    }

    .scan-button {
      background-color: #27c24c !important;
      color: white !important;
    }

    .scan-button:hover {
      background-color: #22a53f !important;
    }

    .finish-button {
      background-color: #003366 !important;
      color: white !important;
    }

    .finish-button.disabled {
      background-color: #ccc !important;
      color: #666 !important;
    }

    .button-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .button-title {
      font-size: 18px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .button-subtitle {
      font-size: 12px;
      opacity: 0.9;
    }

    .scan-button mat-icon, .finish-button mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .logout-button {
      margin-top: 8px;
      color: #666;
    }

    .offline-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: #ff9800;
      color: white;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 600;
    }

    .offline-banner mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class MenuPage {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly ticketState = inject(TicketStateService);
  readonly userName = computed(() => this.authService.userName());
  readonly isOnline = computed(() => this.ticketState.isOnline());
  readonly encargado = computed(() => this.ticketState.session()?.encargado ?? '');
  readonly lugar = computed(() => this.ticketState.session()?.lugar ?? 'OFICINA' as ILugarPredefinido);
  readonly lugarEspecifico = computed(() => this.ticketState.session()?.lugar_especifico ?? '');
  readonly empresa = computed(() => this.authService.getEmpresaActual());
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



  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.router.navigate(['/tickets/scanner'], { state: { file } });
    }

    input.value = '';
  }

  editarTicket(id: string): void {
    this.router.navigate(['/tickets/form'], { state: { editId: id } });
  }

  borrarTicket(event: Event, id: string): void {
    event.stopPropagation(); // Evita que se abra la edición al borrar
    if (confirm('¿Está seguro que desea eliminar este ticket escaneado?')) {
      this.ticketState.removeTicket(id);
    }
  }

  finalizar(): void {
    this.router.navigate(['/tickets/confirm']);
  }

  logout(): void {
    this.authService.logout();
  }
}
