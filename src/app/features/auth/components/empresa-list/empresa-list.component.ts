import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Empresa } from '../../../../core/models/auth.model';

@Component({
    selector: 'app-empresa-list',
    standalone: true,
    imports: [CommonModule, MatListModule, MatIconModule],
    template: `
    <mat-nav-list>
      @for (empresa of empresas; track empresa.idEmpresa) {
        <a mat-list-item (click)="select.emit(empresa.idEmpresa)">
          <mat-icon matListItemIcon>business</mat-icon>
          <span matListItemTitle>{{ empresa.descripcion }}</span>
          <span matListItemLine>ID: {{ empresa.idEmpresa }}</span>
        </a>
      }
    </mat-nav-list>
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
    @Input({ required: true }) empresas: ReadonlyArray<Empresa> = [];
    @Output() select = new EventEmitter<string>();
}
