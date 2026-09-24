import { Component, ChangeDetectionStrategy, signal, Input, HostListener, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="card-header">
      @if (showLogout) {
        <button class="back-btn" (click)="back.emit()">
          <span class="material-icons">logout</span>
        </button>
      }
      <img src="assets/logo-physis.png" alt="Physis Logo" class="logo">
      <h1 class="app-title">{{ title }}</h1>
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

    .back-btn {
      position: absolute;
      left: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: #003366;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .back-btn:active {
      background: rgba(255, 255, 255, 0.4);
      transform: translateY(-50%) scale(0.95);
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
  @Input() title: string = 'Tickets Scanner';
  @Input() showLogout: boolean = true;
  @Output() back = new EventEmitter<void>();
  
  readonly isOnline = signal(navigator.onLine);

  @HostListener('window:online')
  onOnline() {
    this.isOnline.set(true);
  }

  @HostListener('window:offline')
  onOffline() {
    this.isOnline.set(false);
  }
}
