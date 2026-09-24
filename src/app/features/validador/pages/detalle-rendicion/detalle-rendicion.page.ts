import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TextFieldModule } from '@angular/cdk/text-field';

import { ValidadorStateService } from '../../services/validador-state.service';
import { IRendicion, IRendicionTicket, RendicionesService } from '../../services/rendiciones.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TipoGasto } from '../../../../core/models/ticket.model';

@Component({
  selector: 'app-detalle-rendicion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatDatepickerModule,
    MatDialogModule,
    MatSnackBarModule,
    TextFieldModule
  ],
  template: `
    <div class="app-container" *ngIf="rendicion()">
      <!-- Header Estilo Referencia -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-left">
            <button mat-icon-button class="back-btn" (click)="regresar()">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div class="header-text">
              <h1 class="title">Detalle de Rendición</h1>
              <div class="meta-row">
                <span class="meta-item">
                  <mat-icon>person</mat-icon> {{ rendicion()?.usuario }}
                </span>
                <span class="meta-item">
                  <mat-icon>calendar_today</mat-icon> {{ rendicion()?.fecha_recepcion | date:'dd/MM/yyyy' }}
                </span>
                <span class="meta-item" *ngIf="rendicion()?.empresa">
                  <mat-icon>business</mat-icon> 
                  {{ rendicion()?.empresa === 'OTRO' ? rendicion()?.empresa_especifica : rendicion()?.empresa }}
                </span>
              </div>
            </div>
          </div>
          <div class="header-right">
            <div class="total-info">
              <span class="total-label">TOTAL RENDIDO</span>
              <span class="total-value">{{ rendicion()?.total | currency:'ARS':'symbol':'1.2-2' }}</span>
            </div>
            <button mat-icon-button class="logout-btn" (click)="logout()" title="Cerrar Sesión">
              <mat-icon>logout</mat-icon>
            </button>
          </div>
        </div>
      </header>

      <main class="main-content">
        <!-- Auditor Card -->
        <mat-card class="auditor-card fade-in">
          <mat-card-header>
            <mat-icon mat-card-avatar class="header-icon">rate_review</mat-icon>
            <mat-card-title>Observaciones de Auditoría</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Comentarios Generales</mat-label>
              <textarea 
                matInput 
                rows="2" 
                [(ngModel)]="rendicion()!.observaciones"
                placeholder="Indique observaciones sobre la validez..."></textarea>
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        <div class="section-divider">
          <h2 class="section-title">
            <mat-icon>receipt_long</mat-icon>
            Comprobantes <span>({{ rendicion()?.tickets?.length }})</span>
          </h2>
        </div>

        <!-- Tickets List -->
        <div class="tickets-grid">
          @for (item of rendicion()?.tickets; track item.id; let i = $index) {
            <mat-card class="ticket-card fade-in" [style.animation-delay]="i * 0.05 + 's'">
              <div class="ticket-layout">
                <!-- Imagen Thumbnail -->
                <div class="ticket-preview" (click)="verImagen(item)">
                  @if (item.imagen_base64 || item.url_imagen) {
                    <img [src]="item.imagen_base64 || item.url_imagen" alt="Ticket">
                    <div class="preview-overlay">
                      <mat-icon>zoom_in</mat-icon>
                    </div>
                  } @else {
                    <div class="no-image">
                      <mat-icon>hide_image</mat-icon>
                    </div>
                  }
                </div>

                <!-- Formulario Edición Rapida -->
                <div class="ticket-form">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="field-razon">
                      <mat-label>PROVEEDOR / RAZÓN SOCIAL</mat-label>
                      <input matInput [(ngModel)]="item.modificado.razon_social">
                      @if (fueModificado(item, 'razon_social')) {
                        <mat-icon matSuffix class="modified-icon" [title]="'Valor Original IA: ' + (item.ocr_original.razon_social || 'Vacío')">edit_note</mat-icon>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="field-cuit">
                      <mat-label>CUIT</mat-label>
                      <input matInput [(ngModel)]="item.modificado.cuit">
                      @if (fueModificado(item, 'cuit')) {
                        <mat-icon matSuffix class="modified-icon" [title]="'Valor Original IA: ' + (item.ocr_original.cuit || 'Vacío')">edit_note</mat-icon>
                      }
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="field-fecha">
                      <mat-label>FECHA</mat-label>
                      <input matInput [matDatepicker]="picker" 
                             [value]="parseDateStr(item.modificado.fecha)"
                             (dateChange)="updateDate($event, item)">
                      <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                      <mat-datepicker #picker></mat-datepicker>
                      @if (fueModificado(item, 'fecha')) {
                        <mat-icon matSuffix class="modified-icon" [title]="'Valor Original IA: ' + (item.ocr_original.fecha || 'Vacío')">edit_note</mat-icon>
                      }
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="field-operacion">
                      <mat-label>Nº COMPROBANTE</mat-label>
                      <input matInput [(ngModel)]="item.modificado.n_operacion">
                      @if (fueModificado(item, 'n_operacion')) {
                        <mat-icon matSuffix class="modified-icon" [title]="'Valor Original IA: ' + (item.ocr_original.n_operacion || 'Vacío')">edit_note</mat-icon>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="field-tipo">
                      <mat-label>TIPO GASTO</mat-label>
                      <mat-select [(ngModel)]="item.modificado.tipo_gasto">
                        @for (tipo of tiposGasto; track tipo) {
                          <mat-option [value]="tipo">{{ tipo }}</mat-option>
                        }
                      </mat-select>
                      @if (fueModificado(item, 'tipo_gasto')) {
                        <mat-icon matSuffix class="modified-icon" [title]="'Valor Original IA: ' + (item.ocr_original.tipo_gasto || 'Vacío')">edit_note</mat-icon>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="field-pago">
                      <mat-label>MÉTODO DE PAGO</mat-label>
                      <input matInput [(ngModel)]="item.modificado.metodo_pago">
                      @if (fueModificado(item, 'metodo_pago')) {
                        <mat-icon matSuffix class="modified-icon" [title]="'Valor Original IA: ' + (item.ocr_original.metodo_pago || 'Vacío')">edit_note</mat-icon>
                      }
                    </mat-form-field>
                  </div>

                  <!-- Especificación de Gasto (solo si es OTROS) -->
                  <div class="form-row" *ngIf="item.modificado.tipo_gasto === 'OTROS'">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>ESPECIFICAR TIPO DE GASTO</mat-label>
                      <input matInput [(ngModel)]="item.modificado.tipo_gasto_especifico" placeholder="Describa el gasto...">
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="field-iva">
                      <mat-label>IVA $</mat-label>
                      <input matInput type="number" [(ngModel)]="item.modificado.iva">
                      @if (fueModificado(item, 'iva')) {
                        <mat-icon matSuffix class="modified-icon" [title]="'Valor Original IA: ' + (item.ocr_original.iva || '0')">edit_note</mat-icon>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="field-monto">
                      <mat-label>MONTO $</mat-label>
                      <input matInput type="number" [(ngModel)]="item.modificado.monto" (change)="recalcularTotal()">
                      @if (fueModificado(item, 'monto')) {
                        <mat-icon matSuffix class="modified-icon" [title]="'Valor Original IA: ' + (item.ocr_original.monto || '0')">edit_note</mat-icon>
                      }
                    </mat-form-field>
                  </div>

                  <!-- Campo de Observaciones del Ticket -->
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>OBSERVACIONES DEL COMPROBANTE</mat-label>
                      <textarea 
                        matInput 
                        cdkTextareaAutosize
                        #autosize="cdkTextareaAutosize"
                        cdkAutosizeMinRows="1"
                        cdkAutosizeMaxRows="5"
                        [(ngModel)]="item.modificado.observaciones" 
                        placeholder="Ej: Almuerzo con cliente..."></textarea>
                    </mat-form-field>
                  </div>

                  <div class="form-row" *ngIf="item.ocr_original.items && item.ocr_original.items.length > 0">
                    <div class="items-container">
                      <span class="items-label">ARTÍCULOS:</span>
                      <div class="items-tags">
                        @for (prod of item.ocr_original.items; track prod) {
                          <span class="item-tag">{{ prod }}</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </mat-card>
          }
        </div>
      </main>

      <!-- Barra de Acciones Fija -->
      <footer class="bottom-actions">
        <div class="actions-content">
          <div class="status-info">
            <span class="status-label">ESTADO:</span>
            <span [class]="'status-badge ' + rendicion()?.estado">{{ rendicion()?.estado?.toUpperCase() }}</span>
          </div>
          <div class="button-group">
            <button mat-stroked-button color="warn" class="btn-reject" (click)="rechazar()">RECHAZAR</button>
            <button mat-raised-button class="btn-approve" (click)="aprobar()">APROBAR RENDICIÓN</button>
          </div>
        </div>
      </footer>

      <!-- Visor de Imagen (Overlay manual para no complicar con Dialogs si no estan configurados) -->
      <div class="image-overlay" *ngIf="showModal()" (click)="closeModal()">
        <div class="overlay-card" (click)="$event.stopPropagation()">
          <div class="overlay-header">
            <h3>Vista del Comprobante</h3>
            <button mat-icon-button (click)="closeModal()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <div class="overlay-body">
            <img [src]="currentImageUrl()" alt="Ticket Full">
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #f3f4f6;
      min-height: 100vh;
    }

    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .page-header {
      background: linear-gradient(135deg, #003366 0%, #002244 100%);
      color: white;
      padding: 1.5rem;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .back-btn {
      color: white !important;
      background: rgba(255,255,255,0.1) !important;
    }

    .title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
    }

    .meta-row {
      display: flex;
      gap: 1rem;
      margin-top: 0.25rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8125rem;
      color: rgba(255,255,255,0.7);
    }

    .meta-item mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .total-info {
      text-align: right;
    }

    .logout-btn {
      color: white !important;
      background: rgba(255,255,255,0.1) !important;
    }

    .total-label {
      display: block;
      font-size: 0.625rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.7;
    }

    .total-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: #22c55e;
    }

    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem;
      width: 100%;
      flex: 1;
      padding-bottom: 160px;
    }

    .auditor-card {
      margin-bottom: 2rem;
      border-radius: 12px;
      border-left: 4px solid #003366;
    }

    .header-icon {
      color: #003366;
    }

    .full-width {
      width: 100%;
      margin-top: 1rem;
    }

    .section-divider {
      margin-bottom: 1rem;
    }

    .section-title {
      font-size: 1rem;
      font-weight: 700;
      color: #374151;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-transform: uppercase;
    }

    .section-title span {
      color: #6b7280;
      font-weight: 500;
    }

    .tickets-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .ticket-card {
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.2s;
    }

    .ticket-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .ticket-layout {
      display: flex;
      gap: 1.5rem;
      padding: 1rem;
    }

    .ticket-preview {
      width: 120px;
      height: 120px;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      background-color: #f3f4f6;
      cursor: zoom-in;
      flex-shrink: 0;
    }

    .ticket-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .preview-overlay mat-icon {
      color: white;
    }

    .ticket-preview:hover .preview-overlay {
      opacity: 1;
    }

    .no-image {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #9ca3af;
    }

    .ticket-form {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .field-razon { flex: 3; }
    .field-cuit { flex: 1.5; }
    .field-fecha { flex: 1.5; }
    
    .field-operacion { flex: 1.5; }
    .field-tipo { flex: 2; }
    .field-pago { flex: 1.5; }

    .field-iva { flex: 1; }
    .field-monto { flex: 2; }

    .modified-icon {
      color: #ea580c;
      font-size: 20px;
      height: 20px;
      width: 20px;
      cursor: help;
    }

    .items-container {
      margin-top: 0.5rem;
      padding: 0.75rem;
      background: #f0fdfa;
      border-radius: 8px;
      border: 1px solid #ccfbf1;
      width: 100%;
    }

    .items-label {
      display: block;
      font-size: 0.7rem;
      font-weight: 700;
      color: #0d9488;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }

    .items-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .item-tag {
      background: white;
      border: 1px solid #99f6e4;
      color: #0f766e;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .bottom-actions {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: 1rem 1.5rem;
      box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
      z-index: 1000;
    }

    .actions-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .status-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #6b7280;
    }

    .status-badge {
      font-size: 0.75rem;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 20px;
      background: #f3f4f6;
    }

    .status-badge.pendiente { background: #fff7ed; color: #ea580c; }
    .status-badge.aprobada { background: #f0fdf4; color: #16a34a; }
    .status-badge.rechazada { background: #fef2f2; color: #dc2626; }

    .button-group {
      display: flex;
      gap: 1rem;
    }

    .btn-approve {
      background-color: #003366 !important;
      color: white !important;
      padding: 0 2rem !important;
    }

    /* Image Overlay */
    .image-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.85);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      backdrop-filter: blur(4px);
    }

    .overlay-card {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .overlay-header {
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e5e7eb;
    }

    .overlay-header h3 { margin: 0; color: #003366; }

    .overlay-body {
      flex: 1;
      overflow: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: #f9fafb;
    }

    .overlay-body img {
      max-width: 100%;
      border-radius: 8px;
    }

    @media (max-width: 768px) {
      .header-right { display: none; }
      .ticket-layout { flex-direction: column; }
      .ticket-preview { width: 100%; height: 150px; }
      .form-row { flex-direction: column; gap: 0; }
      .button-group { flex-direction: column; width: 100%; }
      .btn-approve, .btn-reject { width: 100%; }
      .actions-content { flex-direction: column; gap: 1rem; }
    }

    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class DetalleRendicionPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private state = inject(ValidadorStateService);
  private rendicionesService = inject(RendicionesService);
  private auth = inject(AuthService);

  readonly rendicion = signal<IRendicion | undefined>(undefined);
  readonly showModal = signal(false);
  readonly currentImageUrl = signal('');
  readonly tiposGasto = [
    'COMIDA', 'COMBUSTIBLE', 'TRANSPORTE', 'PERSONAL', 'PEAJES', 'SERVICIOS', 'LIBRERIA', 'OTROS'
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const data = this.state.seleccionarRendicion(id);
      if (data) {
        this.cargarDatosRendicion(data);
      } else {
        // Soporte F5 y carga directa: consultar la API
        this.rendicionesService.getRendicion(id).subscribe({
          next: (r: IRendicion) => {
            this.cargarDatosRendicion(r);
          },
          error: () => {
            this.router.navigate(['/validador']);
          }
        });
      }
    } else {
      this.router.navigate(['/validador']);
    }
  }

  private cargarDatosRendicion(data: IRendicion): void {
    data.tickets.forEach(t => {
      if (t.modificado?.tipo_gasto) {
        t.modificado.tipo_gasto = t.modificado.tipo_gasto.toUpperCase() as TipoGasto;
      }
    });
    this.rendicion.set(data);
  }

  public parseDateStr(dateStr: string): Date {
    if (!dateStr) return new Date();
    // Soporte para DD/MM/YYYY y YYYY-MM-DD
    let d: Date;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    } else {
      const parts = dateStr.split('-').map(Number);
      if (parts[0] > 1000) { // YYYY-MM-DD
        d = new Date(parts[0], parts[1] - 1, parts[2]);
      } else { // MM-DD-YYYY o similar
        d = new Date(parts[2], parts[0] - 1, parts[1]);
      }
    }
    d.setHours(0, 0, 0, 0);
    return d;
  }

  updateDate(event: MatDatepickerInputEvent<Date>, item: IRendicionTicket): void {
    const date = event.value;
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      item.modificado.fecha = `${year}-${month}-${day}`;
    }
  }

  fueModificado(item: IRendicionTicket, campo: string): boolean {
    if (!item || !item.ocr_original || !item.modificado) return false;
    
    const valOriginal = (item.ocr_original as unknown as Record<string, unknown>)[campo];
    const valModificado = (item.modificado as unknown as Record<string, unknown>)[campo];

    // Si ambos son nulos o vacíos, no hay modificación
    if (!valOriginal && !valModificado) return false;

    // Comparación especial para fechas
    if (campo === 'fecha') {
      try {
        const d1 = this.parseDateStr(String(valOriginal || '')).getTime();
        const d2 = this.parseDateStr(String(valModificado || '')).getTime();
        
        if (isNaN(d1) || isNaN(d2)) {
          return isNaN(d1) !== isNaN(d2);
        }
        
        return d1 !== d2;
      } catch {
        return false;
      }
    }

    // Comparación numérica para montos e IVA
    if (campo === 'monto' || campo === 'iva') {
      const n1 = Number(valOriginal || 0);
      const n2 = Number(valModificado || 0);
      return Math.abs(n1 - n2) > 0.01; // Tolerancia para decimales
    }

    // Comparación de texto normalizada
    const s1 = String(valOriginal || '').trim().toUpperCase();
    const s2 = String(valModificado || '').trim().toUpperCase();
    
    if ((s1 === 'NULL' || s1 === '') && s2 === '') return false;
    
    return s1 !== s2;
  }

  recalcularTotal(): void {
    const data = this.rendicion();
    if (!data) return;
    
    const nuevoTotal = data.tickets.reduce((sum, item) => sum + (Number(item.modificado.monto) || 0), 0);
    this.rendicion.update(r => r ? ({ ...r, total: nuevoTotal }) : undefined);
  }

  verImagen(item: IRendicionTicket): void {
    const imgUrl = item.imagen_base64 || item.url_imagen;
    if (imgUrl) {
      this.currentImageUrl.set(imgUrl);
      this.showModal.set(true);
    }
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  regresar(): void {
    this.router.navigate(['/validador']);
  }

  logout(): void {
    this.auth.logout();
  }

  aprobar(): void {
    const data = this.rendicion();
    if (!data) return;
    
    data.estado = 'aprobada';
    this.rendicionesService.actualizarRendicion(data).subscribe({
      next: () => {
        this.router.navigate(['/validador']);
      },
      error: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al aprobar la rendición';
        alert(msg);
      }
    });
  }

  rechazar(): void {
    const data = this.rendicion();
    if (!data) return;
    
    data.estado = 'rechazada';
    this.rendicionesService.actualizarRendicion(data).subscribe({
      next: () => {
        this.router.navigate(['/validador']);
      },
      error: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al rechazar la rendición';
        alert(msg);
      }
    });
  }
}
