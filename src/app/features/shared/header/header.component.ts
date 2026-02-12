import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule],
    template: `
    <mat-toolbar color="primary">
      <span>{{ title }}</span>
      <span class="spacer"></span>
      @if (showLogout) {
        <button mat-icon-button (click)="logout.emit()" aria-label="Cerrar sesión">
          <mat-icon>logout</mat-icon>
        </button>
      }
    </mat-toolbar>
  `,
    styles: [`
    .spacer {
      flex: 1 1 auto;
    }
  `]
})
export class HeaderComponent {
    @Input() title: string = 'Physis Scanner';
    @Input() showLogout: boolean = false;
    @Output() logout = new EventEmitter<void>();
}
