import { Component, inject, OnInit, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';

import { Router } from '@angular/router';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TicketStateService } from '../../../../core/services/ticket-state.service';
import { OCRService } from '../../../../services/ocr.service';
import { ImageUtils } from '../../../../core/utils/image.utils';
import { IOCROriginalData } from '../../../../core/models/ticket.model';

@Component({
    selector: 'app-scanner',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [],
    template: `
    <div class="phy-main">
      <header class="scanner-header">
        <button 
          id="btn_scanner_back"
          class="back-btn" 
          (click)="router.navigate(['/tickets/menu'])"
        >
          <span class="phy-icon">arrow_back</span>
        </button>
        <div class="scanner-header__text">
          <h1 class="scanner-header__title">{{ statusTitle() }}</h1>
          <p class="scanner-header__subtitle">{{ statusSubtitle() }}</p>
        </div>
      </header>

      <section class="phy-section scanner-body">
        <div class="scanner-card fade-in">
          <div class="scanner-visual">
            <div class="scanner-ring" [class.scanner-ring--error]="error()">
              <span class="phy-icon">{{ error() ? 'error_outline' : 'document_scanner' }}</span>
            </div>
            @if (!error()) {
              <div class="scanner-beam"></div>
            }
          </div>

          <div class="scanner-info">
            @if (error()) {
              <div id="error_view" class="error-view">
                <h2 class="error-view__title">LECTURA FALLIDA</h2>
                <p class="error-view__msg">{{ error() }}</p>
                <div class="error-actions">
                  <button id="btn_manual_entry" class="phy-btn phy-btn--block" (click)="goToManual()">
                    INGRESO MANUAL
                  </button>
                  <button 
                    id="btn_cancel_scanner" 
                    class="logout-link" 
                    (click)="router.navigate(['/tickets/menu'])"
                  >
                    CANCELAR
                  </button>
                </div>
              </div>
            } @else {
              <div class="processing-view">
                <div class="pulse-spinner"></div>
                <p class="processing-msg">PROCESANDO DOCUMENTO...</p>
              </div>
            }
          </div>
        </div>
      </section>

    </div>
  `,
    styles: [`
    .scanner-header {
      background: white;
      padding: 2.5rem 1.5rem 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .back-btn {
      background: #f1f5f9;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      cursor: pointer;
    }

    .scanner-header__text {
      display: flex;
      flex-direction: column;
    }

    .scanner-header__title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--phy-primary-dark);
      margin: 0;
    }

    .scanner-header__subtitle {
      font-size: 0.85rem;
      color: var(--phy-grey-dark);
      margin: 0;
    }

    .scanner-body {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .scanner-card {
      background: white;
      border-radius: 24px;
      padding: 2.5rem 1.5rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      text-align: center;
    }

    .scanner-visual {
      position: relative;
      width: 140px;
      height: 140px;
      margin: 0 auto 2rem;
    }

    .scanner-ring {
      width: 100%;
      height: 100%;
      background: #f8fafc;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--phy-brand);
      border: 2px dashed #e2e8f0;
    }

    .scanner-ring .phy-icon {
      font-size: 56px;
    }

    .scanner-ring--error {
      color: var(--phy-error);
      background: #fff5f5;
      border-color: #fed7d7;
    }

    .scanner-beam {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: var(--phy-brand);
      border-radius: 2px;
      box-shadow: 0 0 15px var(--phy-brand);
      animation: scanBeam 2s ease-in-out infinite;
    }

    @keyframes scanBeam {
      0%, 100% { top: 10%; opacity: 0; }
      50% { top: 90%; opacity: 1; }
    }

    .status-box {
      background: #f8fafc;
      padding: 1.25rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      text-align: left;
    }

    .status-box__title {
      font-size: 0.9rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      color: var(--phy-primary);
    }

    .status-box__msg {
      font-size: 0.8rem;
      color: var(--phy-grey-dark);
      margin: 0.5rem 0 0 0;
    }

    .status-box--warning {
      background: #fffbeb;
      border: 1px solid #fef3c7;
    }

    .processing-view {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .pulse-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #f1f5f9;
      border-top-color: var(--phy-brand);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .processing-msg {
      font-weight: 700;
      color: var(--phy-primary);
      font-size: 0.9rem;
      letter-spacing: 1px;
    }

    .error-view__title {
      color: var(--phy-error);
      font-weight: 800;
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
    }

    .error-view__msg {
      color: #64748b;
      font-size: 0.9rem;
      margin-bottom: 2rem;
    }

    .logout-link {
      background: none;
      border: none;
      color: #94a3b8;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      padding: 0.5rem;
      text-align: center;
      width: 100%;
    }
  `]
})
export class ScannerPage implements OnInit {
  public readonly router = inject(Router);
  private readonly ticketState = inject(TicketStateService);
  private readonly ocrService = inject(OCRService);
  private readonly imageUtils = inject(ImageUtils);
  private readonly destroyRef = inject(DestroyRef);

  readonly statusTitle = signal<string>('Escaneando');
  readonly statusSubtitle = signal<string>('Digitalizando comprobante...');
  readonly error = signal<string>('');
  readonly isOnline = signal<boolean>(navigator.onLine);

  private currentFile: File | null = null;
  private currentPreview: string = '';

  constructor() {
    fromEvent(window, 'online')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.isOnline.set(true));

    fromEvent(window, 'offline')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.isOnline.set(false));

    const navigation = this.router.getCurrentNavigation();
    const file = navigation?.extras?.state?.['file'] as File | undefined;
    if (file) this.currentFile = file;
  }

  ngOnInit(): void {
    if (!this.currentFile) {
      const stateFile = history.state.file as File | undefined;
      if (stateFile) this.currentFile = stateFile;
    }

    if (!this.currentFile) {
      this.router.navigate(['/tickets/menu']);
      return;
    }

    this.processFile(this.currentFile);
  }

  private async processFile(file: File): Promise<void> {
    try {
      this.statusTitle.set('Procesando');
      this.statusSubtitle.set('Optimizando imagen...');

      const { blob, previewUrl } = await this.imageUtils.optimizeImage(file);
      this.currentPreview = previewUrl;

      const optimizedFile = new File([blob], file.name, { type: 'image/jpeg' });
      this.statusTitle.set('Analizando');
      this.statusSubtitle.set('Extrayendo datos...');

      this.callOCR(optimizedFile, previewUrl);

    } catch (err) {
      console.error('Error:', err);
      this.error.set('Error al procesar la imagen');
    }
  }

  private callOCR(file: File, preview: string): void {
    this.ocrService.processImage(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: IOCROriginalData) => {
          this.navigateToForm(file, preview, data);
        },
        error: (err: Error) => {
          console.error('OCR Error:', err);
          this.error.set('No se pudo leer automáticamente');
          this.statusTitle.set('Error');
          this.statusSubtitle.set('Lectura fallida');
        }
      });
  }

  private navigateToForm(file: File, preview: string, ocrData: IOCROriginalData | {}): void {
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
