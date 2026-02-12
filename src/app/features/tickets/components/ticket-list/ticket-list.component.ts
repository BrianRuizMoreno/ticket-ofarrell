import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketCardComponent } from '../ticket-card/ticket-card.component';
import { TicketResumen } from '../../../../core/models/ticket.model';

@Component({
    selector: 'app-ticket-list',
    standalone: true,
    imports: [CommonModule, TicketCardComponent],
    template: `
    <div class="ticket-list">
      @for (ticket of tickets; track ticket.id) {
        <app-ticket-card 
          [ticket]="ticket" 
          (edit)="edit.emit($event)">
        </app-ticket-card>
      }
      @if (tickets.length === 0) {
        <div class="empty-state">
          <p>No hay tickets registrados</p>
        </div>
      }
    </div>
  `,
    styles: [`
    .ticket-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .empty-state {
      text-align: center;
      padding: 32px;
      color: #999;
    }
  `]
})
export class TicketListComponent {
    @Input() tickets: ReadonlyArray<TicketResumen> = [];
    @Output() edit = new EventEmitter<string>();
}
