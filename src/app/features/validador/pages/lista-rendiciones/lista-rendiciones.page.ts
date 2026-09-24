import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { ValidadorStateService } from '../../services/validador-state.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-lista-rendiciones',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="validador-container">
      <!-- Header -->
      <header class="validador-header">
        <div class="header-content">
          <div class="header-branding">
            <img src="assets/logo-physis.png" alt="Physis Logo" class="header-logo">
            <div>
              <h1 class="header-title">Validación de Rendiciones</h1>
              <p class="header-subtitle">Pendientes de revisión</p>
            </div>
          </div>
          <button mat-icon-button class="logout-button" (click)="logout()" title="Cerrar Sesión">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </header>

      <section class="content-section">
        <div class="section-actions">
          <h2 class="section-label">Rendiciones Recibidas</h2>
          <div class="action-group">
            <button 
              mat-stroked-button 
              class="refresh-button" 
              (click)="actualizar()" 
              [disabled]="state.loading()"
            >
              <mat-icon [class.spinning]="state.loading()">refresh</mat-icon>
              {{ state.loading() ? 'Sincronizando' : 'Actualizar' }}
            </button>
          </div>
        </div>

        @if (state.loading() && state.rendiciones().length === 0) {
          <div class="loading-state">
            <mat-spinner diameter="48"></mat-spinner>
            <p>Obteniendo rendiciones...</p>
          </div>
        } @else if (state.rendiciones().length === 0) {
          <mat-card class="empty-state">
            <mat-icon class="empty-icon">inbox</mat-icon>
            <h3 class="empty-title">Bandeja Vacía</h3>
            <p class="empty-text">No hay rendiciones pendientes en este momento.</p>
            <button mat-button color="primary" (click)="actualizar()">Verificar de nuevo</button>
          </mat-card>
        } @else {
          <div class="rendiciones-list">
            @for (rendicion of state.rendiciones(); track rendicion.id) {
              <mat-card class="rendicion-card">
                <div class="rendicion-main" (click)="verDetalle(rendicion.id)">
                  <div class="user-info">
                    <div class="user-details">
                      <h3 class="user-name">
                        <span class="label">Encargado de rendir:</span> {{ rendicion.usuario }}
                      </h3>
                      <p class="user-empresa">
                        <span class="label">Lugar / Evento:</span> 
                        {{ rendicion.empresa === 'OTRO' ? rendicion.empresa_especifica : rendicion.empresa }}
                      </p>
                    </div>
                  </div>
                  <div class="amount-info">
                    <p class="amount-total">{{ rendicion.total | currency:'ARS':'symbol':'1.2-2' }}</p>
                    <span class="amount-tickets">{{ rendicion.cantidad_tickets }} tickets</span>
                  </div>
                </div>

                <mat-divider></mat-divider>

                <div class="rendicion-footer">
                  <div class="footer-meta">
                    <mat-icon>calendar_today</mat-icon>
                    <span>{{ rendicion.fecha_recepcion | date:'dd/MM HH:mm' }}</span>
                  </div>
                  <div class="footer-actions">
                    @if (rendicionABorrar() === rendicion.id) {
                      <div class="confirm-actions">
                        <button mat-stroked-button color="warn" class="small-btn" (click)="confirmarBorrado(rendicion.id, $event)">Borrar</button>
                        <button mat-button class="small-btn" (click)="cancelarBorrado($event)">Cancelar</button>
                      </div>
                    } @else {
                      <div class="delete-btn-wrapper" (click)="solicitarBorrado(rendicion.id, $event)" title="Eliminar permanentemente">
                        <mat-icon color="warn">delete</mat-icon>
                      </div>
                      <span [class]="'status-badge ' + rendicion.estado">
                        {{ rendicion.estado }}
                      </span>
                      <mat-icon class="arrow-icon" (click)="verDetalle(rendicion.id)">chevron_right</mat-icon>
                    }
                  </div>
                </div>
              </mat-card>
            }
          </div>
        }
      </section>


    </div>
  `,
  styles: [`
    .validador-container {
      min-height: 100vh;
      background-color: #f5f5f5;
      display: flex;
      flex-direction: column;
    }

    .validador-header {
      background-color: #003366;
      color: white;
      padding: 1.5rem 1rem;
      padding-top: max(1.5rem, env(safe-area-inset-top) + 1rem);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 800px;
      margin: 0 auto;
      width: 100%;
    }

    .header-branding {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-logo {
      height: 32px;
      width: auto;
      filter: brightness(0) invert(1);
    }

    .header-title {
      font-size: 1.5rem;
      font-weight: 800;
      margin: 0;
    }

    .header-subtitle {
      font-size: 0.875rem;
      opacity: 0.8;
      margin: 0;
    }

    .logout-button {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }

    .content-section {
      flex: 1;
      padding: 1.5rem 1rem;
      max-width: 800px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }

    .section-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-label {
      font-size: 0.75rem;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0;
    }

    .refresh-button {
      color: #003366;
      border-color: #003366;
    }

    .action-group {
      display: flex;
      gap: 0.75rem;
    }

    .rendiciones-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-bottom: 2rem;
    }

    .rendicion-card {
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      border-radius: 12px;
      overflow: hidden;
    }

    .rendicion-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      border-color: #55c1e6;
    }

    .rendicion-main {
      padding: 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 44px;
      height: 44px;
      background: #003366;
      color: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.875rem;
    }

    .user-name {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: #1e293b;
    }

    .user-name .label, .user-empresa .label {
      color: #64748b;
      font-weight: 500;
      font-size: 0.8rem;
    }

    .user-empresa {
      margin: 0;
      font-size: 0.85rem;
      font-weight: 600;
      color: #003366;
    }

    .amount-info {
      text-align: right;
    }

    .amount-total {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 800;
      color: #003366;
    }

    .amount-tickets {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
    }

    .rendicion-footer {
      padding: 0.5rem 1.25rem;
      background-color: #f8fafc;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 600;
    }

    .footer-meta mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .footer-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      position: relative;
      z-index: 100;
      min-height: 40px;
    }

    .confirm-actions {
      display: flex;
      gap: 0.5rem;
      background: #fff5f5;
      padding: 0.25rem;
      border-radius: 8px;
      border: 1px solid #fecaca;
      animation: fadeIn 0.3s ease;
    }

    .small-btn {
      line-height: 24px;
      padding: 0 12px;
      min-width: 60px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .delete-btn-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      background: rgba(220, 38, 38, 0.1);
      transition: all 0.2s;
    }

    .delete-btn-wrapper:hover {
      background: rgba(220, 38, 38, 0.2);
      transform: scale(1.1);
    }

    .status-badge {
      font-size: 0.625rem;
      font-weight: 800;
      padding: 2px 10px;
      border-radius: 20px;
      text-transform: uppercase;
    }

    .status-badge.pendiente { background: #fff7ed; color: #ea580c; }
    .status-badge.procesando { background: #eff6ff; color: #2563eb; }
    .status-badge.completada { background: #f0fdf4; color: #16a34a; }

    .arrow-icon {
      color: #cbd5e1;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 1rem;
      color: #64748b;
      gap: 1rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      color: #64748b;
      border-radius: 16px;
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .validador-footer {
      padding: 1.5rem;
      text-align: center;
      color: #94a3b8;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      margin: 0;
    }

    .footer-brand mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
})
export class ListaRendicionesPage implements OnInit {
  readonly state = inject(ValidadorStateService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  ngOnInit() {
    this.actualizar();
  }

  actualizar() {
    this.state.cargarRendiciones();
  }

  limpiar() {
    if (confirm('¿Estás seguro de que quieres eliminar todas las rendiciones recibidas? Esta acción no se puede deshacer.')) {
      this.state.limpiarTodo();
    }
  }

  rendicionABorrar = signal<string | null>(null);

  solicitarBorrado(id: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.rendicionABorrar.set(id);
  }

  cancelarBorrado(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.rendicionABorrar.set(null);
  }

  confirmarBorrado(id: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Borrando definitivamente rendición:', id);
    this.state.eliminarRendicion(id);
    this.rendicionABorrar.set(null);
  }

  verDetalle(id: string) {
    this.router.navigate(['/validador/detalle', id]);
  }

  logout() {
    this.auth.logout();
  }
}
