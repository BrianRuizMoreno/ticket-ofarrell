import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="phy-header">
      <div class="phy-header__container">
        <span class="phy-header__title">{{ title }}</span>
        <div class="phy-header__spacer"></div>
        @if (showLogout) {
          <button class="phy-btn phy-btn--icon" (click)="logout.emit()" aria-label="Cerrar sesión">
            <span class="phy-icon">logout</span>
          </button>
        }
      </div>
    </header>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
  `]
})
export class HeaderComponent {
  @Input() title: string = 'Tickets Scanner';
  @Input() showLogout: boolean = false;
  @Output() logout = new EventEmitter<void>();
}
