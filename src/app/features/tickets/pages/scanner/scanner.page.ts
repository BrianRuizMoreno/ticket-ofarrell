import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { TicketStateService } from '../../../../services/ticket-state.service';
import { OCRService } from '../../../../services/ocr.service';
import { ImageUtils } from '../../../../core/utils/image.utils';
import { OCROriginalData } from '../../../../core/models/ticket.model';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="app-container">
      <div class="main-card">
        
        <header class="card-header">
          <img src="https://physis.com.ar/wp-content/uploads/2025/02/physis.png" alt="Physis Logo" class="logo">
          <h1 class="app-title">Cargador de Tickets</h1>
        </header>

        <main class="card-body centered-content">
          <div class="spinner-container">
            <div class="spinner-ring">
              <div class="spinner-logo">PHYSIS</div>
              <mat-progress-spinner 
                mode="indeterminate" 
                diameter="120" 
                strokeWidth="4"
                class="custom-spinner"
              ></mat-progress-spinner>
            </div>
            
            <h2 class="status-title">{{ statusTitle() }}</h2>
            <p class="status-subtitle">{{ statusSubtitle() }}</p>

            @if (error()) {
              <div class="error-container fade-in">
                <mat-icon>error_outline</mat-icon>
                <span>{{ error() }}</span>
              </div>
              
              <button class="manual-button" (click)="goToManual()">
                Ingresar Manualmente
              </button>
            }
          </div>
        </main>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f3f4f6;
    }

    /* Responsive Background */
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

    /* Header */
    .card-header {
      background-color: #55c1e6;
      padding: 1.5rem;
      text-align: center;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .logo {
      width: 100px;
      margin-bottom: 0.75rem;
      filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07));
    }

    .app-title {
      color: #003366;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }

    /* Body */
    .card-body {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      background-color: white;
      position: relative;
    }

    .centered-content {
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    /* Spinner */
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .spinner-ring {
      position: relative;
      margin-bottom: 2rem;
      width: 120px;
      height: 120px;
    }

    .spinner-logo {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 0.75rem;
      font-weight: 900;
      color: #003366;
      letter-spacing: 0.1em;
      z-index: 10;
    }

    /* Customizing Angular Material Spinner */
    ::ng-deep .custom-spinner circle {
      stroke: #003366 !important;
    }

    .status-title {
      color: #003366;
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .status-subtitle {
      color: #9ca3af;
      font-size: 0.875rem;
      margin: 0;
    }

    /* Error */
    .error-container {
      margin-top: 2rem;
      padding: 0.75rem;
      background-color: #fef2f2;
      border: 1px solid #fca5a5;
      border-radius: 0.5rem;
      color: #b91c1c;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .manual-button {
      margin-top: 1rem;
      background-color: #003366;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
    }
  `]
})
export class ScannerPage implements OnInit {
  private readonly router = inject(Router);
  private readonly ticketState = inject(TicketStateService);
  private readonly ocrService = inject(OCRService);
  private readonly imageUtils = inject(ImageUtils);
  readonly statusTitle = signal<string>('Analizando ticket...');
  readonly statusSubtitle = signal<string>('Extrayendo datos con IA');
  readonly error = signal<string>('');
  private currentFile: File | null = null;
  private currentPreview: string = '';

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const file = navigation?.extras?.state?.['file'];

    if (file) {
      this.currentFile = file;
    }
  }

  ngOnInit(): void {
    if (!this.currentFile) {
      const stateFile = history.state.file;
      if (stateFile) {
        this.currentFile = stateFile;
      }
    }

    if (!this.currentFile) {
      this.router.navigate(['/tickets/menu']);
      return;
    }

    this.processFile(this.currentFile);
  }

  private async processFile(file: File): Promise<void> {
    try {
      this.statusTitle.set('Optimizando...');
      this.statusSubtitle.set('Preparando imagen');

      const { blob, previewUrl } = await this.imageUtils.optimizeImage(file);
      this.currentPreview = previewUrl;

      const optimizedFile = new File([blob], file.name, { type: 'image/jpeg' });

      this.statusTitle.set('Analizando ticket...');
      this.statusSubtitle.set('Extrayendo datos con IA');

      this.callOCR(optimizedFile, previewUrl);

    } catch (err) {
      console.error('Error optimización:', err);
      this.error.set('Error al procesar la imagen');
    }
  }

  private callOCR(file: File, preview: string): void {
    this.ocrService.processImage(file).subscribe({
      next: (data: OCROriginalData) => {
        this.navigateToForm(file, preview, data);
      },
      error: (err: Error) => {
        console.error('OCR Error:', err);
        this.error.set('No se pudo leer automáticamente');
        this.statusTitle.set('Error de lectura');
        this.statusSubtitle.set('Intente ingresar manualmente');
      }
    });
  }

  private navigateToForm(file: File, preview: string, ocrData: OCROriginalData): void {
    this.router.navigate(['/tickets/form'], {
      state: { file, preview, ocrData }
    });
  }

  goToManual(): void {
    if (this.currentFile) {
      if (!this.currentPreview) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.navigateToForm(this.currentFile!, e.target?.result as string, {});
        };
        reader.readAsDataURL(this.currentFile);
      } else {
        this.navigateToForm(this.currentFile, this.currentPreview, {});
      }
    }
  }
}
