import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-loading',
    standalone: true,
    imports: [CommonModule, MatProgressSpinnerModule],
    template: `
    <div class="loading-container">
      <mat-spinner [diameter]="diameter"></mat-spinner>
      <p *ngIf="message">{{ message }}</p>
    </div>
  `,
    styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 200px;
    }
    p {
      margin-top: 16px;
      color: #666;
    }
  `]
})
export class LoadingComponent {
    @Input() diameter: number = 40;
    @Input() message: string = '';
}
