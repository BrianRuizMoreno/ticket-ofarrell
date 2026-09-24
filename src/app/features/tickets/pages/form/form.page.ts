import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';


import { TicketStateService } from '../../../../core/services/ticket-state.service';
import {
  IOCROriginalData,
  ITicketModifiedData,
  TipoGasto,
  MetodoPago,
} from '../../../../core/models/ticket.model';

interface ITicketNavigationState {
  readonly editId?: string;
  readonly file?: File | null;
  readonly preview?: string;
  readonly ocrData?: IOCROriginalData;
}

interface FormState {
  file: File | null;
  preview: string;
  ocrData: IOCROriginalData;
}

@Component({
    selector: 'app-form',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        PageHeaderComponent
    ],
    template: `
    <div class="app-container">
      <div class="main-card">
        
        <app-page-header></app-page-header>

        <main class="card-body">
          <div class="form-header-row">
            <h2 class="section-title">Revisar Datos</h2>
            <div class="header-actions">

              <button class="cancel-button" (click)="cancelar()">Cancelar</button>
            </div>
          </div>

          <div class="preview-section">
            <div class="preview-label">VISTA PREVIA</div>
            <img [src]="preview()" alt="Comprobante" class="preview-image" (click)="openFullImage()">
          </div>

          <form [formGroup]="ticketForm" (ngSubmit)="guardar()" class="ticket-form">
            
            <!-- Razón Social -->
            <div class="form-group">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>PROVEEDOR / RAZÓN SOCIAL *</mat-label>
                <input matInput formControlName="razon_social" placeholder="Nombre del comercio">
              </mat-form-field>
            </div>

            <!-- CUIT y N Op -->
            <div class="form-row">
              <mat-form-field appearance="outline" class="half">
                <mat-label>CUIT</mat-label>
                <input matInput formControlName="cuit" placeholder="30-...">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="half">
                <mat-label>N° OP</mat-label>
                <input matInput formControlName="n_operacion">
              </mat-form-field>
            </div>

            <!-- Tipo de Gasto -->
            <div class="form-group">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>TIPO DE GASTO *</mat-label>
                <mat-select formControlName="tipo_gasto">
                  @for (tipo of tiposGasto; track tipo.value) {
                    <mat-option [value]="tipo.value">{{ tipo.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Especificar Tipo -->
            @if (esOtroTipo()) {
              <div class="form-group field-appear">
                <mat-form-field appearance="outline" class="full-width color-red">
                  <mat-label>ESPECIFICAR TIPO *</mat-label>
                  <input matInput formControlName="tipo_gasto_especifico" placeholder="¿Qué tipo de gasto?">
                </mat-form-field>
              </div>
            }

            <!-- Metodo y Fecha -->
            <div class="form-row">
              <mat-form-field appearance="outline" class="half">
                <mat-label>MÉTODO DE PAGO</mat-label>
                <mat-select formControlName="metodo_pago">
                  @for (metodo of metodosPago; track metodo) {
                    <mat-option [value]="metodo">{{ metodo }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half">
                <mat-label>FECHA *</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="fecha">
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
            </div>

            <!-- IVA y Total -->
            <div class="form-row">
              <mat-form-field appearance="outline" class="half">
                <mat-label>IVA $</mat-label>
                <input matInput type="number" formControlName="iva" placeholder="0.00" class="text-right">
              </mat-form-field>

              <mat-form-field appearance="outline" class="half">
                <mat-label>TOTAL $ *</mat-label>
                <input matInput type="number" formControlName="monto" placeholder="0.00" class="text-right total-input">
              </mat-form-field>
            </div>

            <!-- Observaciones -->
            <div class="form-group">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>OBSERVACIONES</mat-label>
                <textarea matInput formControlName="observaciones" placeholder="Detalles adicionales..." rows="3"></textarea>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button 
                type="submit" 
                mat-raised-button
                color="primary"
                class="submit-button"
                [disabled]="ticketForm.invalid"
              >
                GUARDAR ESTE TICKET
              </button>
            </div>

          </form>
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
      gap: 1.5rem;
      padding-bottom: 4rem;
      overflow-y: auto;
    }

    .form-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #003366;
      margin: 0;
    }

    .cancel-button {
      background: none;
      border: none;
      color: #ef4444;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .preview-section {
      width: 100%;
      height: 120px;
      background-color: #f3f4f6;
      border-radius: 0.5rem;
      position: relative;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid #e5e7eb;
    }

    .preview-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      cursor: zoom-in;
    }

    .preview-label {
      position: absolute;
      bottom: 0;
      left: 0;
      background-color: #003366;
      color: white;
      padding: 2px 8px;
      font-size: 0.625rem;
      font-weight: 700;
    }

    .ticket-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .half {
      flex: 1;
    }

    .input-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .label-red {
      color: #ef4444;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      background-color: #f9fafb;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      outline: none;
      font-size: 0.9375rem;
      color: #1f2937;
      box-sizing: border-box;
      transition: all 0.2s;
    }

    .form-input:focus {
      box-shadow: 0 0 0 2px #55c1e6;
      border-color: transparent;
    }

    .form-input.error {
      border-color: #ef4444;
      background-color: #fef2f2;
    }

    .total-input {
      font-weight: 700;
      color: #003366;
      font-size: 1.125rem;
    }

    .text-right {
      text-align: right;
    }

    .textarea-input {
      resize: vertical;
      min-height: 80px;
    }

    .input-red {
      background-color: #fef2f2;
      border-color: #fca5a5;
    }
    
    .input-red:focus {
      box-shadow: 0 0 0 2px #f87171;
    }

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

    .form-actions {
      padding-top: 1rem;
    }

    .submit-button {
      width: 100%;
      background-color: #22c55e;
      color: white;
      font-weight: 700;
      font-size: 1rem;
      padding: 1rem;
      border-radius: 0.5rem;
      text-transform: uppercase;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: all 0.2s;
    }

    .submit-button:hover {
      background-color: #16a34a;
    }
    
    .submit-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background-color: #d1d5db;
    }

    .field-appear {
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown { 
      from { opacity: 0; max-height: 0; } 
      to { opacity: 1; max-height: 200px; } 
    }

    ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }

    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: #f9fafb !important;
    }

    .text-right {
      text-align: right;
    }

    .total-input {
      font-weight: 700 !important;
      color: #003366 !important;
    }
  `]
})
export class FormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ticketState = inject(TicketStateService);
  private readonly destroyRef = inject(DestroyRef);

  private editId: string | null = null;

  private state: FormState = {
    file: null,
    preview: '',
    ocrData: {}
  };

  readonly preview = signal<string>('');
  readonly esOtroTipo = signal(false);
  readonly tiposGasto: ReadonlyArray<{ value: TipoGasto; label: string }> = [
    { value: 'COMBUSTIBLE', label: 'Combustible' },
    { value: 'COMIDA', label: 'Comida' },
    { value: 'TRANSPORTE', label: 'Transporte' },
    { value: 'PERSONAL', label: 'Personal (Peones u otros)' },
    { value: 'PEAJES', label: 'Peajes' },
    { value: 'ALOJAMIENTOS', label: 'Alojamientos' },
    { value: 'SERVICIOS', label: 'Servicios (Corte de pasto u otros)' },
    { value: 'LIBRERIA', label: 'Librería' },
    { value: 'OTROS', label: 'Otros (Especificar)' }
  ];

  readonly metodosPago: ReadonlyArray<MetodoPago> = [
    'Efectivo',
    'Tarjeta de Crédito',
    'Tarjeta de Débito',
    'Transferencia'
  ];

  readonly ticketForm = this.fb.nonNullable.group({
    razon_social: ['', Validators.required],
    cuit: [''],
    n_operacion: [''],
    tipo_gasto: ['' as TipoGasto, Validators.required],
    tipo_gasto_especifico: [''],
    metodo_pago: ['Efectivo' as MetodoPago],
    fecha: [new Date(), Validators.required],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    iva: [0],
    observaciones: ['']
  });

  isFieldInvalid(fieldName: string): boolean {
    const field = this.ticketForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }


  openFullImage(): void {
    if (this.state.preview) {
      const win = window.open('', '_blank', 'noopener,noreferrer');
      if (win) {
        win.opener = null;
        win.location.href = this.state.preview;
      }
    }
  }

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as ITicketNavigationState | undefined;

    if (state?.editId) {
      this.editId = state.editId;
    } else if (state?.file) {
      this.state.file = state.file;
      this.state.preview = state.preview ?? '';
      this.state.ocrData = state.ocrData ?? {};
      this.preview.set(this.state.preview);
    }
  }

  ngOnInit(): void {
    if (this.editId) {
      const ticket = this.ticketState.getTicketById(this.editId!);
      if (ticket) {
        this.state.file = ticket.archivo;
        this.state.preview = ticket.preview;
        this.state.ocrData = ticket.datos_ocr_original;
        this.preview.set(this.state.preview);
        
        this.populateFormFromModified(ticket.datos_modificados);
      } else {
        this.router.navigate(['/tickets/confirm']);
        return;
      }
    } else if (!this.state.file) {
      const state = history.state as ITicketNavigationState | undefined;
      if (state?.editId) {
        this.editId = state.editId;
        const ticket = this.ticketState.getTicketById(this.editId!);
        if (ticket) {
          this.state.file = ticket.archivo;
          this.state.preview = ticket.preview;
          this.state.ocrData = ticket.datos_ocr_original;
          this.preview.set(this.state.preview);
          this.populateFormFromModified(ticket.datos_modificados);
        }
      } else if (state?.file) {
        this.state.file = state.file;
        this.state.preview = state.preview ?? '';
        this.state.ocrData = state.ocrData ?? {};
        this.preview.set(this.state.preview);
        this.populateForm(this.state.ocrData);
      } else {
        this.router.navigate(['/tickets/menu']);
        return;
      }
    } else {
      this.populateForm(this.state.ocrData);
    }

    this.ticketForm.controls.tipo_gasto.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        const isOtro = val === 'OTROS';
        this.esOtroTipo.set(isOtro);

        const especificoControl = this.ticketForm.controls.tipo_gasto_especifico;
        if (isOtro) {
          especificoControl.setValidators(Validators.required);
        } else {
          especificoControl.clearValidators();
          especificoControl.setValue('');
        }
        especificoControl.updateValueAndValidity();
      });
  }

  private populateFormFromModified(data: ITicketModifiedData): void {
    const fecha = typeof data.fecha === 'string' ? this.parseFecha(data.fecha) : new Date(data.fecha);
    
    this.ticketForm.patchValue({
      razon_social: data.razon_social,
      cuit: data.cuit,
      n_operacion: data.n_operacion,
      tipo_gasto: data.tipo_gasto,
      tipo_gasto_especifico: data.tipo_gasto_especifico,
      metodo_pago: data.metodo_pago,
      fecha: fecha || new Date(),
      monto: data.monto,
      iva: data.iva,
      observaciones: data.observaciones
    });
    
    if (data.tipo_gasto === 'OTROS') {
      this.esOtroTipo.set(true);
    }
  }

  private populateForm(data: IOCROriginalData): void {
    const fechaStr = (data.fecha ?? data['Fecha'] ?? data['FECHA']) as string | undefined;
    const fecha = this.parseFecha(fechaStr) ?? new Date();
    const tipoGasto = this.normalizarTipoGasto(data.tipo_gasto as string | undefined) as TipoGasto;

    this.ticketForm.patchValue({
      razon_social: (data.razon_social ?? data.vendor ?? '') as string,
      cuit: (data.cuit ?? '') as string,
      n_operacion: (data.n_operacion ?? data.ticket_number ?? data.numero ?? '') as string,
      tipo_gasto: tipoGasto,
      metodo_pago: (data.metodo_pago ?? 'Efectivo') as MetodoPago,
      fecha: fecha,
      monto: (data.monto ?? data.total ?? 0) as number,
      iva: (data.iva ?? data.impuesto ?? 0) as number
    });

    // Disparar el estado del campo "especificar" manualmente,
    // ya que el patchValue ocurre antes de que valueChanges esté suscrito.
    if (tipoGasto === 'OTROS') {
      this.esOtroTipo.set(true);
      this.ticketForm.controls.tipo_gasto_especifico.setValidators(Validators.required);
      this.ticketForm.controls.tipo_gasto_especifico.updateValueAndValidity();
    }
  }

  private parseFecha(fechaStr: string | undefined): Date | null {
    if (!fechaStr) return null;

    const partes = fechaStr.split(/[\/\-]/);
    if (partes.length === 3) {
      // Formato ISO: YYYY-MM-DD
      if (partes[0].length === 4) {
        const anio = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1;
        const dia = parseInt(partes[2], 10);
        return new Date(anio, mes, dia);
      }
      // Formato tradicional: DD/MM/YYYY o DD-MM-YYYY
      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const anio = partes[2].length === 2 ? 2000 + parseInt(partes[2], 10) : parseInt(partes[2], 10);
      return new Date(anio, mes, dia);
    }

    const iso = Date.parse(fechaStr);
    return isNaN(iso) ? null : new Date(iso);
  }

  private normalizarTipoGasto(tipo: string | undefined): string {
    if (!tipo) return '';
    const upper = tipo.toUpperCase();
    if (upper.includes('COMBUSTIBLE')) return 'COMBUSTIBLE';
    if (upper.includes('COMIDA')) return 'COMIDA';
    if (upper.includes('TRANSPORTE')) return 'TRANSPORTE';
    if (upper.includes('PERSONAL')) return 'PERSONAL';
    if (upper.includes('PEAJE')) return 'PEAJES';
    if (upper.includes('ALOJAMIENTO')) return 'ALOJAMIENTOS';
    if (upper.includes('SERVICIO')) return 'SERVICIOS';
    if (upper.includes('LIBRERIA')) return 'LIBRERIA';
    if (upper.includes('OTRO')) return 'OTROS';
    return '';
  }

  guardar(): void {
    if (this.ticketForm.invalid) return;

    const formValue = this.ticketForm.getRawValue();

    const modifiedData: ITicketModifiedData = {
      razon_social: formValue.razon_social,
      cuit: formValue.cuit,
      n_operacion: formValue.n_operacion,
      tipo_gasto: formValue.tipo_gasto,
      tipo_gasto_especifico: formValue.tipo_gasto_especifico,
      metodo_pago: formValue.metodo_pago,
      fecha: this.formatFecha(formValue.fecha),
      monto: formValue.monto,
      iva: formValue.iva,
      observaciones: formValue.observaciones
    };

    if (this.editId) {
      this.ticketState.updateTicket(this.editId!, modifiedData);
      this.router.navigate(['/tickets/confirm']);
    } else {
      const ticket = this.ticketState.createTicket(
        this.state.file,
        this.state.preview,
        this.state.ocrData,
        modifiedData
      );

      this.ticketState.addTicket(ticket);
      this.router.navigate(['/tickets/decision']);
    }
  }

  private formatFecha(fecha: Date): string {
    const tzoffset = fecha.getTimezoneOffset() * 60000;
    const localISOTime = new Date(fecha.getTime() - tzoffset).toISOString().slice(0, 10);
    return localISOTime;
  }

  cancelar(): void {
    if (this.editId) {
      this.router.navigate(['/tickets/confirm']);
    } else {
      this.router.navigate(['/tickets/menu']);
    }
  }


}
