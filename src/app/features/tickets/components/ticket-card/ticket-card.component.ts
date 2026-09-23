import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ITicketResumen } from '../../../../core/models/ticket.model';

@Component({
    selector: 'app-ticket-card',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="phy-card ticket-card" [class.ticket-card--modified]="ticket.fueModificado">
      <div class="ticket-card__header">
        <div class="ticket-card__icon">
          <span class="phy-icon">receipt</span>
        </div>
        <div class="ticket-card__info">
          <h3 class="ticket-card__title">{{ ticket.razon }}</h3>
          <p class="ticket-card__subtitle">{{ ticket.fecha | date:'dd/MM/yyyy' }}</p>
        </div>
      </div>
      <div class="ticket-card__body">
        <div class="ticket-card__type">
          {{ ticket.tipo }}
          @if (ticket.tipo === 'OTROS') {
            <span> - {{ ticket.tipoEspecifico }}</span>
          }
        </div>
        <div class="ticket-card__amount">
          {{ ticket.monto | currency:'ARS':'symbol':'1.2-2' }}
        </div>
      </div>
      <div class="ticket-card__footer">
        <button 
          id="btn_edit_ticket_{{ticket.id}}"
          class="phy-btn phy-btn--secondary phy-btn--small" 
          (click)="edit.emit(ticket.id)"
        >
          EDITAR
        </button>
      </div>
    </div>
  `,
    styles: [`
    .ticket-card {
      margin-bottom: 12px;
      transition: box-shadow 0.2s;
    }
    .ticket-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .ticket-card.modified {
      border-left: 4px solid #ff9800;
    }
    .ticket-avatar {
      background-color: #eee;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ticket-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
    }
    .ticket-type {
      color: #666;
      font-size: 14px;
    }
    .ticket-amount {
      font-weight: bold;
      color: #27c24c;
      font-size: 16px;
    }
  `]
})
export class TicketCardComponent {
    @Input({ required: true }) ticket!: ITicketResumen;
    @Output() edit = new EventEmitter<string>();
}
