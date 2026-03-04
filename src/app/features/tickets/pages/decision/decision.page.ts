import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { TicketStateService } from '../../../../core/services/ticket-state.service';

@Component({
  selector: 'app-decision',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="decision-container">
      <div class="success-icon">
        <mat-icon>check</mat-icon>
      </div>

      <h1 class="title">¡Ticket Guardado!</h1>
      <p class="subtitle">¿Qué desea hacer ahora?</p>

      <div class="actions">
        <button 
          mat-raised-button 
          class="scan-button"
          (click)="scanOtro()"
        >
          <mat-icon>add_a_photo</mat-icon>
          <span>Escanear OTRO Ticket</span>
        </button>

        <button 
          mat-raised-button 
          class="finish-button"
          (click)="finalizar()"
        >
          <mat-icon>check_circle</mat-icon>
          <span>Finalizar y Enviar</span>
        </button>
      </div>

      <div class="total-info">
        <span>Total acumulado:</span>
        <span class="total-amount">
          {{ totalMonto() | currency:'ARS':'symbol':'1.2-2' }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .decision-container {
      min-height: 100vh;
      background: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }

    .success-icon {
      width: 100px;
      height: 100px;
      background: #27c24c;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      animation: bounce 0.5s ease;
      box-shadow: 0 4px 20px rgba(39, 194, 76, 0.4);
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .success-icon mat-icon {
      font-size: 60px;
      width: 60px;
      height: 60px;
      color: white;
    }

    .title {
      color: #003366;
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #666;
      font-size: 16px;
      margin-bottom: 32px;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      max-width: 300px;
      margin-bottom: 32px;
    }

    .scan-button, .finish-button {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 16px;
      font-weight: bold;
      border-radius: 12px;
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

    .finish-button:hover {
      background-color: #002244 !important;
    }

    .total-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      color: #666;
      font-size: 14px;
    }

    .total-amount {
      color: #003366;
      font-size: 24px;
      font-weight: bold;
    }
  `]
})
export class DecisionPage {
  private readonly router = inject(Router);
  private readonly ticketState = inject(TicketStateService);

  readonly totalMonto = computed(() => this.ticketState.totalMonto());

  scanOtro(): void {
    this.router.navigate(['/tickets/menu']);
  }

  finalizar(): void {
    this.router.navigate(['/tickets/confirm']);
  }
}
