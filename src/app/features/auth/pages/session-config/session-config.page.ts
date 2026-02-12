import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketStateService } from '../../../../core/services/ticket-state.service';
import { LugarPredefinido } from '../../../../core/models/ticket.model';

@Component({
  selector: 'app-session-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="app-container">
      <div class="main-card">
        
        <header class="card-header">
          <img src="https://physis.com.ar/wp-content/uploads/2025/02/physis.png" alt="Physis Logo" class="logo">
          <h1 class="app-title">Cargador de Ticket</h1>
          <div class="network-status"></div>
        </header>

        <main class="card-body">
          <div class="step-config fade-in">
            <div class="header-text">
              <h2 class="section-title">Configuración</h2>
              <p class="section-subtitle">Ingrese los datos de la rendición</p>
            </div>

            <form [formGroup]="sessionForm" (ngSubmit)="onSubmit()" class="config-form">
              <div class="form-group">
                <label class="input-label">ENCARGADO DE RENDIR *</label>
                <input 
                  type="text" 
                  formControlName="encargado" 
                  class="form-input" 
                  placeholder="Nombre completo"
                  [class.error]="isFieldInvalid('encargado')"
                >
              </div>

              <div class="form-group">
                <label class="input-label">LUGAR *</label>
                <div class="select-wrapper">
                  <select formControlName="lugar" class="form-input form-select" [class.error]="isFieldInvalid('lugar')">
                    <option value="" disabled selected>Seleccionar lugar...</option>
                    <option value="REMATE_FISICO">Remate Físico</option>
                    <option value="REMATE_CABANA">Remate Cabaña</option>
                    <option value="OFICINA">Oficina</option>
                    <option value="CORPORATIVO">Corporativo</option>
                    <option value="OTRO">Otro (Especificar)</option>
                  </select>
                </div>
              </div>

              @if (showLugarEspecifico) {
                <div class="form-group field-appear">
                  <label class="input-label label-red">ESPECIFICAR LUGAR *</label>
                  <input 
                    type="text" 
                    formControlName="lugar_especifico" 
                    class="form-input input-red" 
                    placeholder="Detalle el lugar"
                    [class.error]="isFieldInvalid('lugar_especifico')"
                  >
                </div>
              }

              <div class="form-actions">
                <button 
                  type="submit" 
                  class="submit-button"
                  [disabled]="sessionForm.invalid"
                >
                  COMENZAR
                </button>
              </div>
            </form>
          </div>
        </main>
        
        <footer class="card-footer">
          <p class="footer-brand">Physis es marca registrada de Physis Informatica S.R.L.</p>
        </footer>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f3f4f6; /* bg-gray-100 */
    }

    /* Responsive Background */
    @media (min-width: 768px) {
      .app-container {
        padding: 1rem;
        background-color: #49a5c5; /* md:bg-[#49a5c5] */
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
      }
      
      .main-card {
        max-width: 28rem; /* md:max-w-md */
        border-radius: 0.75rem; /* md:rounded-xl */
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); /* shadow-2xl */
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

    /* Header */
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
      font-size: 1.5rem; /* text-2xl */
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
      background-color: #22c55e; /* green-500 */
      border: 2px solid white;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    }

    /* Body */
    .card-body {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      background-color: white;
      position: relative;
    }

    .step-config {
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
      gap: 1.5rem;
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); } 
      to { opacity: 1; transform: translateY(0); }
    }

    .header-text {
      text-align: center;
      margin-bottom: 1rem;
    }

    .section-title {
      font-size: 1.25rem; /* text-xl */
      font-weight: 700;
      color: #003366;
      margin: 0;
    }

    .section-subtitle {
      font-size: 0.875rem; /* text-sm */
      color: #6b7280; /* text-gray-500 */
      margin: 0;
    }

    /* Form */
    .config-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .input-label {
      font-size: 0.75rem; /* text-xs */
      font-weight: 700;
      color: #6b7280; /* text-gray-500 */
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .label-red {
      color: #ef4444; /* text-red-500 */
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      background-color: #f9fafb; /* bg-gray-50 */
      border: 1px solid #d1d5db; /* border-gray-300 */
      border-radius: 0.5rem; /* rounded-lg */
      outline: none;
      font-size: 1rem;
      box-sizing: border-box;
      transition: all 0.2s;
    }

    .form-input:focus {
      box-shadow: 0 0 0 2px #55c1e6; /* ring-[#55c1e6] */
      border-color: transparent;
    }

    .form-input.error {
      border-color: #ef4444;
      background-color: #fef2f2;
    }

    .input-red {
      background-color: #fef2f2; /* bg-red-50 */
      border-color: #fca5a5; /* border-red-300 */
    }

    .input-red:focus {
      box-shadow: 0 0 0 2px #f87171; /* ring-red-400 */
    }

    /* Select specific */
    .select-wrapper {
      position: relative;
    }

    .form-select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 20px;
    }

    /* Animation for new fields */
    .field-appear {
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown { 
      from { opacity: 0; max-height: 0; } 
      to { opacity: 1; max-height: 200px; } 
    }

    /* Actions */
    .form-actions {
      margin-top: auto;
      padding-top: 1.5rem;
    }

    .submit-button {
      width: 100%;
      background-color: #003366;
      color: white;
      font-weight: 700;
      font-size: 1.125rem; /* text-lg */
      padding: 1rem;
      border-radius: 0.75rem; /* rounded-xl */
      text-transform: uppercase;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .submit-button:hover {
      background-color: #002244;
    }

    .submit-button:active {
      transform: scale(0.95);
    }

    .submit-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    /* Footer */
    .card-footer {
      padding: 1rem;
      text-align: center;
      background-color: #f9fafb; /* bg-gray-50 */
      border-top: 1px solid #f3f4f6; /* border-gray-100 */
      flex-shrink: 0;
    }

    .footer-brand {
      color: #9ca3af; /* text-gray-400 */
      font-size: 0.75rem; /* text-xs */
      font-weight: 700;
      margin: 0;
    }

    .footer-version {
      font-size: 0.625rem; /* text-[10px] */
      color: #d1d5db; /* text-gray-300 */
      margin-top: 0.25rem;
    }
  `]
})
export class SessionConfigPage {
  private readonly fb = inject(FormBuilder);
  private readonly ticketState = inject(TicketStateService);
  private readonly router = inject(Router);

  readonly sessionForm = this.fb.nonNullable.group({
    encargado: ['', Validators.required],
    lugar: ['', Validators.required],
    lugar_especifico: ['']
  });

  get showLugarEspecifico(): boolean {
    return this.sessionForm.get('lugar')?.value === 'OTRO';
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

    const { encargado, lugar, lugar_especifico } = this.sessionForm.getRawValue();

    this.ticketState.startSession(
      encargado,
      lugar as LugarPredefinido,
      lugar === 'OTRO' ? lugar_especifico : ''
    );

    this.router.navigate(['/tickets/menu']);
  }
}

