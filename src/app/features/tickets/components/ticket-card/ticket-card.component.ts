import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TicketResumen } from '../../../../core/models/ticket.model';

@Component({
    selector: 'app-ticket-card',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
    template: `
    <mat-card class="ticket-card" [class.modified]="ticket.fueModificado">
      <mat-card-header>
        <div mat-card-avatar class="ticket-avatar">
          <mat-icon>receipt</mat-icon>
        </div>
        <mat-card-title>{{ ticket.razon }}</mat-card-title>
        <mat-card-subtitle>{{ ticket.fecha | date:'dd/MM/yyyy' }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="ticket-details">
          <div class="ticket-type">
            {{ ticket.tipo }}
            <span *ngIf="ticket.tipo === 'OTROS'"> - {{ ticket.tipoEspecifico }}</span>
          </div>
          <div class="ticket-amount">
            {{ ticket.monto | currency:'ARS':'symbol':'1.2-2' }}
          </div>
        </div>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button (click)="edit.emit(ticket.id)">EDITAR</button>
      </mat-card-actions>
    </mat-card>
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
    @Input({ required: true }) ticket!: TicketResumen;
    @Output() edit = new EventEmitter<string>();
}
