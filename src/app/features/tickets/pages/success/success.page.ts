import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TicketStateService } from '../../../../core/services/ticket-state.service';

@Component({
  selector: 'app-success',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="success-container">
      <div class="success-icon">
        <mat-icon>check</mat-icon>
      </div>

      <h1 class="title">¡Enviado!</h1>
      
      <p class="message">
        Se enviaron <strong>{{ ticketsCount() }}</strong> tickets correctamente.
      </p>

      <button 
        mat-raised-button 
        class="new-session-button"
        (click)="nuevaSesion()"
      >
        Nueva Sesión
      </button>
    </div>
  `,
  styles: [`
    .success-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #003366 0%, #55c1e6 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }

    .success-icon {
      width: 120px;
      height: 120px;
      background: #22c55e;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 32px;
      animation: bounce 0.6s ease infinite alternate;
      box-shadow: 0 8px 32px rgba(34, 197, 94, 0.5);
    }

    @keyframes bounce {
      from { transform: translateY(0) scale(1); }
      to { transform: translateY(-10px) scale(1.05); }
    }

    .success-icon mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: white;
    }

    .title {
      color: white;
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 16px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .message {
      color: rgba(255,255,255,0.9);
      font-size: 18px;
      margin-bottom: 48px;
      max-width: 300px;
      line-height: 1.5;
    }

    .new-session-button {
      height: 56px;
      padding: 0 48px;
      font-size: 18px;
      font-weight: bold;
      text-transform: uppercase;
      border-radius: 28px;
      background-color: white !important;
      color: #003366 !important;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      border: none;
      cursor: pointer;
    }

    .new-session-button:hover {
      background-color: #f3f4f6 !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.4);
    }
  `]
})
export class SuccessPage {
  private readonly router = inject(Router);
  private readonly ticketState = inject(TicketStateService);

  readonly ticketsCount = computed(() => this.ticketState.ticketsCount());

  nuevaSesion(): void {
    this.ticketState.clearSession();
    this.router.navigate(['/session-config']);
  }
}
