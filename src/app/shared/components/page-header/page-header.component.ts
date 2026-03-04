import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { TicketStateService } from '../../../core/services/ticket-state.service';

@Component({
  selector: 'app-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="card-header">
      <img src="https://logos-portal.my.canva.site/_assets/media/170043df6943e6d8d3722bbcdd5c7104.png" alt="Physis Logo" class="logo">
      <h1 class="app-title">Tickets Scanner</h1>
      <div class="network-status" [class.offline]="!isOnline()"></div>
    </header>
  `,
  styles: [`
    .card-header {
      background-color: #55c1e6;
      padding: 1.5rem;
      text-align: center;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    .logo {
      width: 100px;
      margin-bottom: 0.75rem;
      filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07));
    }

    .app-title {
      color: #003366;
      font-size: 1.5rem; 
      font-weight: 700;
      margin: 0;
      margin-bottom: 0.25rem;
    }

    .network-status {
      position: absolute;
      top: 1rem;
      right: 1rem;
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
  `]
})
export class PageHeaderComponent {
  private readonly ticketState = inject(TicketStateService);
  readonly isOnline = this.ticketState ? this.ticketState.isOnline : signal(true);
}
