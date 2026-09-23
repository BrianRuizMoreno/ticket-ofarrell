import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SyncService } from './core/services/sync.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class AppComponent {
  private readonly syncService = inject(SyncService);
  title = 'Tickets Physis';
}