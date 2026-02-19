import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth.service';
import { BiometricService } from '../../../../core/services/biometric.service';
import { AuthError } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
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
              <h2 class="section-title">Bienvenido</h2>
              <p class="section-subtitle">Inicie sesión para continuar</p>
            </div>

            @if (error()) {
              <div class="error-container">
                <span class="error-message">
                  {{ error()?.message }}
                </span>
              </div>
            }

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="config-form">
              <div class="form-group">
                <label class="input-label">USUARIO *</label>
                <input 
                  type="text" 
                  formControlName="username" 
                  class="form-input" 
                  placeholder="Ingrese su usuario"
                  [class.error]="isFieldInvalid('username')"
                >
              </div>

              <div class="form-group">
                <label class="input-label">CONTRASEÑA *</label>
                <div class="password-wrapper">
                  <input 
                    [type]="hidePassword() ? 'password' : 'text'" 
                    formControlName="password" 
                    class="form-input password-input" 
                    placeholder="Ingrese su contraseña"
                    [class.error]="isFieldInvalid('password')"
                  >
                  <button type="button" class="visibility-toggle" (click)="togglePasswordVisibility()">
                    <mat-icon>{{ hidePassword() ? 'visibility' : 'visibility_off' }}</mat-icon>
                  </button>
                </div>
              </div>

              <div class="form-actions">
                <button 
                  type="submit" 
                  class="submit-button"
                  [disabled]="loginForm.invalid || isLoading()"
                >
                  @if (isLoading()) {
                    CARGANDO...
                  } @else {
                    INGRESAR
                  }
                </button>

                @if (biometricAvailable() && lastUsername()) {
                  <button 
                    type="button" 
                    class="biometric-button fade-in" 
                    (click)="loginBiometric()"
                    title="Ingresar con biometría"
                  >
                    <mat-icon>fingerprint</mat-icon>
                    <span>Usar Huella / FaceID</span>
                  </button>
                }
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

    /* Password field specific */
    .password-wrapper {
      position: relative;
    }

    .password-input {
      padding-right: 2.5rem;
    }

    .visibility-toggle {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      color: #6b7280; /* text-gray-500 */
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .visibility-toggle:hover {
      color: #374151; /* text-gray-700 */
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

    .biometric-button {
      width: 100%;
      margin-top: 1rem;
      background-color: white;
      color: #003366;
      border: 2px solid #003366;
      font-weight: 700;
      padding: 0.75rem;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .biometric-button mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .biometric-button:hover {
      background-color: #f0f7ff;
    }

    /* Error Message */
    .error-container {
      padding: 0.75rem;
      background-color: #fef2f2;
      border: 1px solid #fca5a5;
      border-radius: 0.5rem;
      color: #b91c1c;
      font-size: 0.875rem;
      text-align: center;
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
export class LoginPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly biometricService = inject(BiometricService);
  private readonly router = inject(Router);

  readonly hidePassword = signal<boolean>(true);
  readonly isLoading = signal<boolean>(false);
  readonly biometricAvailable = signal<boolean>(false);
  readonly lastUsername = signal<string>(localStorage.getItem('last_success_user') || '');
  readonly error = signal<AuthError | null>(null);

  readonly loginForm = this.fb.nonNullable.group({
    username: [this.lastUsername(), Validators.required],
    password: ['', Validators.required]
  });

  async ngOnInit() {
    this.biometricAvailable.set(await this.biometricService.isAvailable());
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((value: boolean) => !value);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  async loginBiometric() {
    const rawUsername = this.loginForm.getRawValue().username || this.lastUsername();
    const username = rawUsername ? rawUsername.trim() : '';

    if (!username) {
      this.error.set({
        code: 'BIO_ERROR',
        message: 'Ingrese un usuario para usar biometría.',
        statusCode: 0
      });
      return;
    }

    const success = await this.biometricService.login(username);
    if (success) {
      const savedPass = localStorage.getItem(`bio_key_${username}`);
      if (savedPass) {
        this.loginForm.patchValue({ username, password: savedPass });
        this.onSubmit();
      } else {
        this.error.set({
          code: 'BIO_ERROR',
          message: 'Biometría activada pero requiere ingreso manual una vez más.',
          statusCode: 0
        });
      }
    } else {
      this.error.set({
        code: 'BIO_ERROR',
        message: 'No se pudo validar la biometría o no está registrada.',
        statusCode: 0
      });
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const { username, password } = this.loginForm.getRawValue();

    this.authService.login(username, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        const cleanUsername = username.trim();
        localStorage.setItem('last_success_user', cleanUsername);

        if (this.biometricAvailable() && localStorage.getItem(`bio_enabled_${cleanUsername}`) !== 'true') {
          if (confirm('¿Desea habilitar el acceso con biometría (Huella/Cara) para la próxima vez?')) {
            this.biometricService.register(cleanUsername).then(registered => {
              if (registered) {
                localStorage.setItem(`bio_key_${cleanUsername}`, password);
              }
            });
          }
        }
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.error.set({
          code: 'LOGIN_ERROR',
          message: err.message,
          statusCode: 0
        });
      }
    });
  }
}
