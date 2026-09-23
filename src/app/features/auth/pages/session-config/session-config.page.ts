import { Component, inject, signal, computed, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketStateService } from '../../../../core/services/ticket-state.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ILugarPredefinido } from '../../../../core/models/ticket.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-session-config',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        PageHeaderComponent,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
        MatIconModule
    ],
    template: `
    <div class="app-container">
      <div class="main-card">
        
        <app-page-header [showLogout]="false"></app-page-header>

        <main class="card-body">
          <div class="config-section fade-in">
            <div class="header-text">
              <h2 class="section-title">Configuración</h2>
              <p class="section-subtitle">Complete los datos de la rendición</p>
            </div>

            <form [formGroup]="sessionForm" (ngSubmit)="onSubmit()" class="config-form">
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>ENCARGADO DE RENDIR</mat-label>
                <input matInput formControlName="encargado" placeholder="Nombre y Apellido">
                <mat-icon matPrefix>badge</mat-icon>
                @if (isFieldInvalid('encargado')) {
                  <mat-error>El nombre del encargado es obligatorio</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>LUGAR / EVENTO</mat-label>
                <mat-select formControlName="lugar">
                  <mat-option value="REMATE_FISICO">Remate Físico</mat-option>
                  <mat-option value="REMATE_CABANA">Remate Cabaña</mat-option>
                  <mat-option value="OFICINA">Oficina</mat-option>
                  <mat-option value="CORPORATIVO">Corporativo</mat-option>
                  <mat-option value="OTRO">Otro (Especificar)</mat-option>
                </mat-select>
                <mat-icon matPrefix>place</mat-icon>
              </mat-form-field>

              @if (showLugarEspecifico()) {
                <mat-form-field appearance="outline" class="full-width slide-down">
                  <mat-label>ESPECIFICAR LUGAR</mat-label>
                  <input matInput formControlName="lugar_especifico" placeholder="Detalle el lugar u ocasión">
                  <mat-icon matPrefix>edit_location</mat-icon>
                  @if (isFieldInvalid('lugar_especifico')) {
                    <mat-error>Debe especificar el lugar u ocasión</mat-error>
                  }
                </mat-form-field>
              }

              <div class="form-actions">
                <button 
                  mat-raised-button
                  color="primary"
                  type="submit" 
                  class="submit-button"
                  [disabled]="sessionForm.invalid"
                >
                  COMENZAR
                </button>

                <button 
                  mat-stroked-button
                  type="button" 
                  class="secondary-button"
                  (click)="logout()"
                >
                  <mat-icon>logout</mat-icon>
                  CAMBIAR USUARIO
                </button>
              </div>
            </form>
          </div>
        </main>

        <footer class="card-footer">
          <p class="footer-text">
            EMPRESA: {{ empresa() }}
          </p>
        </footer>
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f3f4f6;
    }

    @media (min-width: 768px) {
      .app-container {
        padding: 1rem;
        background-color: #49a5c5;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
      }
      
      .main-card {
        max-width: 28rem;
        border-radius: 0.75rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        min-height: auto !important;
      }
    }

    .app-container {
      width: 100%;
      min-height: 100vh;
    }

    .main-card {
      width: 100%;
      min-height: 100vh;
      background-color: white;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }

    .card-body {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      background-color: white;
      padding: 1.5rem;
    }

    .config-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .header-text {
      text-align: center;
      margin-bottom: 1rem;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #003366;
      margin: 0;
    }

    .section-subtitle {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }

    .config-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }

    .submit-button {
      height: 56px !important;
      font-weight: 700 !important;
      font-size: 1.125rem !important;
      border-radius: 0.75rem !important;
    }

    .secondary-button {
      height: 48px !important;
      color: #003366 !important;
      border-color: #003366 !important;
      border-radius: 0.75rem !important;
    }

    .card-footer {
      padding: 1rem;
      text-align: center;
      background-color: #f9fafb;
      border-top: 1px solid #f3f4f6;
    }

    .footer-text {
      color: #9ca3af;
      font-size: 0.75rem;
      font-weight: 700;
      margin: 0;
    }

    .slide-down {
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from { opacity: 0; max-height: 0; transform: translateY(-10px); }
      to { opacity: 1; max-height: 100px; transform: translateY(0); }
    }

    ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }
  `]
})

export class SessionConfigPage {
  private readonly fb          = inject(FormBuilder);
  private readonly ticketState = inject(TicketStateService);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);
  private readonly destroyRef  = inject(DestroyRef);
  
  readonly empresa = computed(() => this.authService.getEmpresaActual());

  readonly sessionForm = this.fb.nonNullable.group({
    encargado: [this.ticketState.session()?.encargado || this.authService.userName(), Validators.required],
    lugar: [this.ticketState.session()?.lugar || '', Validators.required],
    lugar_especifico: [this.ticketState.session()?.lugar_especifico || '']
  });

  readonly showLugarEspecifico = computed(
    () => this.lugarValue() === 'OTRO'
  );

  private readonly lugarValue = signal<string>(this.sessionForm.get('lugar')?.value || '');

  constructor() {
    this.sessionForm.get('lugar')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.lugarValue.set(value || '');
        const especField = this.sessionForm.get('lugar_especifico');
        if (value === 'OTRO') {
          especField?.setValidators([Validators.required]);
        } else {
          especField?.clearValidators();
        }
        especField?.updateValueAndValidity();
      });
  }
  isFieldInvalid(fieldName: string): boolean {
    const field = this.sessionForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  onSubmit(): void {
    if (this.sessionForm.invalid) {
      this.sessionForm.markAllAsTouched();
      return;
    }

    const formValue = this.sessionForm.getRawValue();
    const encargado = formValue.encargado;
    const lugar = formValue.lugar;
    const lugar_especifico = formValue.lugar_especifico;

    this.ticketState.startSession(
      encargado,
      lugar as ILugarPredefinido,
      lugar === 'OTRO' ? lugar_especifico : ''
    );

    this.router.navigate(['/tickets/menu']);
  }

  logout(): void {
    this.authService.logout();
  }
}
