import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../../core/services/auth.service';
import { IEmpresa } from '../../../../core/models/auth.model';

@Component({
    selector: 'app-empresa-select',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatCardModule,
        MatButtonModule,
        MatListModule,
        MatRadioModule,
        MatProgressSpinnerModule,
        MatIconModule
    ],
    template: `
    <div class="empresa-container">
      <mat-card class="empresa-card">
        <mat-card-header class="empresa-header">
          <mat-card-title>Seleccionar Empresa</mat-card-title>
          <mat-card-subtitle>
            Hola {{ nombreUsuario() }}, selecciona la empresa para continuar
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (isLoading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Cargando...</p>
            </div>
          } @else {
            <div class="empresas-list">
              @for (empresa of empresas(); track empresa.idEmpresa) {
                <div 
                  class="empresa-item"
                  [class.selected]="selectedId() === empresa.idEmpresa"
                  (click)="selectEmpresa(empresa.idEmpresa)"
                >
                  <mat-icon class="empresa-icon">business</mat-icon>
                  <div class="empresa-info">
                    <div class="empresa-nombre">{{ empresa.descripcion }}</div>
                    <div class="empresa-id">ID: {{ empresa.idEmpresa }}</div>
                  </div>
                  @if (selectedId() === empresa.idEmpresa) {
                    <mat-icon class="check-icon">check_circle</mat-icon>
                  }
                </div>
              }
            </div>

            @if (error()) {
              <div class="error-message">
                <mat-icon>error</mat-icon>
                <span>{{ error() }}</span>
              </div>
            }

            <button 
              mat-raised-button 
              color="primary" 
              class="full-width confirm-button"
              [disabled]="!selectedId() || isSubmitting()"
              (click)="confirmarSeleccion()"
            >
              @if (isSubmitting()) {
                <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
                <span>Procesando...</span>
              } @else {
                <span>Confirmar Selección</span>
              }
            </button>

            <button 
              mat-button 
              color="warn" 
              class="full-width logout-button"
              (click)="logout()"
            >
              <mat-icon>logout</mat-icon>
              Cerrar Sesión
            </button>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styles: [`
    .empresa-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #003366 0%, #55c1e6 100%);
      padding: 16px;
    }

    .empresa-card {
      width: 100%;
      max-width: 500px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }

    .empresa-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 24px;
    }

    mat-card-title {
      color: #003366;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    mat-card-subtitle {
      color: #666;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      gap: 16px;
    }

    .empresas-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 24px 0;
    }

    .empresa-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .empresa-item:hover {
      border-color: #55c1e6;
      background-color: #f0f9ff;
    }

    .empresa-item.selected {
      border-color: #003366;
      background-color: #e3f2fd;
    }

    .empresa-icon {
      color: #003366;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .empresa-info {
      flex: 1;
    }

    .empresa-nombre {
      font-weight: 600;
      color: #003366;
      font-size: 16px;
    }

    .empresa-id {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }

    .check-icon {
      color: #27c24c;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: #ffebee;
      color: #c62828;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .confirm-button {
      height: 48px;
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .logout-button {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .inline-spinner {
      display: inline-block;
    }

    ::ng-deep .mat-mdc-raised-button.mat-primary {
      background-color: #003366;
    }

    ::ng-deep .mat-mdc-raised-button.mat-primary:hover {
      background-color: #002244;
    }
  `]
})
export class EmpresaSelectPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly selectedId = signal<string>('');
  readonly error = signal<string>('');

  readonly empresas = computed((): ReadonlyArray<IEmpresa> => this.authService.empresasDisponibles() ?? []);
  readonly nombreUsuario = computed(() => this.authService.getNombreUsuario());

  constructor() {
    if (this.empresas().length === 0) {
      this.router.navigate(['/login']);
    }
  }

  selectEmpresa(id: string): void {
    this.selectedId.set(id);
    this.error.set('');
  }

  confirmarSeleccion(): void {
    const id = this.selectedId();
    if (!id) return;

    this.isSubmitting.set(true);
    this.error.set('');

    this.authService.selectEmpresa(id).subscribe({
      error: (err: Error) => {
        this.isSubmitting.set(false);
        this.error.set(err.message);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
