import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IEmpresa } from '../../../../core/models/auth.model';

@Component({
    selector: 'app-empresa-list',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="phy-list">
      @for (empresa of empresas; track empresa.idEmpresa) {
        <div class="phy-list-item" (click)="select.emit(empresa.idEmpresa)">
          <div class="phy-list-item__icon">
            <span class="phy-icon">business</span>
          </div>
          <div class="phy-list-item__content">
            <div class="phy-list-item__title">{{ empresa.descripcion }}</div>
            <div class="phy-list-item__subtitle">ID: {{ empresa.idEmpresa }}</div>
          </div>
        </div>
      }
    </div>
  `,
    styles: [`
    mat-nav-list {
      padding-top: 0;
    }
    a[mat-list-item] {
      cursor: pointer;
    }
  `]
})
export class EmpresaListComponent {
    @Input({ required: true }) empresas: ReadonlyArray<IEmpresa> = [];
    @Output() select = new EventEmitter<string>();
}
