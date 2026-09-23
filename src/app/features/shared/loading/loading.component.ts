import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
    selector: 'app-loading',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="phy-loading-container">
      <div class="phy-spinner" [style.width.px]="diameter" [style.height.px]="diameter"></div>
      @if (message) {
        <p class="phy-loading-message">{{ message }}</p>
      }
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
