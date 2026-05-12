import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Employee } from '../../models/employee.interface';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmState } from '../../models/confirm-state.interface';
import { EmployeeRow } from '../../models/employee-row.interface';
import { Team } from '../../models/team';
import { ToastService } from '../../services/toast.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmComponent, MatIconModule, TranslateModule],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
  employees: EmployeeRow[] = [];
  teams: Team[] = [];
  confirmState: ConfirmState = { visible: false, title: '', message: '', target: null as any };

  constructor(
    private api: ApiService,
    private toastService: ToastService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.api.getTeams().subscribe((t) => {
      this.teams = (t || []).filter(team => team.name !== null).map(team => ({
        id: team.id,
        name: team.name ?? ''
      }));
      this.load();
    });
  }

  load(): void {
    this.api.listEmployees().subscribe((list: Employee[]) => {
      this.employees = (list || []).map((e) => ({
        id: e.id,
        firstName: e.firstName,
        lastName: e.lastName,
        monthlyHoursTarget: e.monthlyHoursTarget || 160,
        isActive: e.isActive ?? true,
        teamId: e.teamId,
        team: this.teams.find(t => t.id === e.teamId) || null
      }));
    });
  }

  addNew(): void {
    this.employees.unshift({
      firstName: '',
      lastName: '',
      monthlyHoursTarget: 160,
      isActive: true,
      teamId: null,
      _editing: true
    });
  }

  edit(row: EmployeeRow): void {
    row._editing = true;
  }

  cancel(row: EmployeeRow): void {
    if (!row.id) {
      this.employees = this.employees.filter(e => e !== row);
    } else {
      row._editing = false;
      this.load();
    }
  }

  save(row: EmployeeRow): void {
    if (!row) return;

    const model: Employee = {
      firstName: row.firstName,
      lastName: row.lastName,
      monthlyHoursTarget: row.monthlyHoursTarget,
      isActive: row.isActive,
      teamId: row.teamId || null,
      id: row.id || 0
    };

    if (model.id) {
      this.api.updateEmployee(model.id, model).subscribe({
        next: () => {
          row._editing = false;
          this.load();
          this.toastService.show(this.translate.instant('EMPLOYEES.SUCCESS_UPDATE'), 'success');
        },
        error: () => this.toastService.show(this.translate.instant('EMPLOYEES.ERROR_UPDATE'), 'error')
      });
    } else {
      this.api.createEmployee(model).subscribe({
        next: () => {
          this.load();
          this.toastService.show(this.translate.instant('EMPLOYEES.SUCCESS_ADD'), 'success');
        },
        error: () => this.toastService.show(this.translate.instant('EMPLOYEES.ERROR_ADD'), 'error')
      });
    }
  }

  remove(row: EmployeeRow): void {
    if (!row.id) {
      this.employees = this.employees.filter((r) => r !== row);
      return;
    }

    this.confirmState = {
      visible: true,
      title: this.translate.instant('EMPLOYEES.DELETE'),
      message: `${this.translate.instant('EMPLOYEES.CONFIRM_DELETE')} ${row.firstName} ${row.lastName}?`,
      target: row
    };
  }

  onConfirmedRemove(): void {
    const row: EmployeeRow = this.confirmState.target;
    if (!row || !row.id) return;

    this.api.deleteEmployee(row.id).subscribe({
      next: () => {
        this.load();
        this.toastService.show(this.translate.instant('EMPLOYEES.SUCCESS_DELETE'), 'success');
      },
      error: () => this.toastService.show(this.translate.instant('EMPLOYEES.ERROR_DELETE'), 'error')
    });
    this.confirmState.visible = false;
    this.confirmState.target = null;
  }

  onCancelledRemove(): void {
    this.confirmState.visible = false;
    this.confirmState.target = null;
  }

  getInitials(firstName: string, lastName: string): string {
    if (!firstName && !lastName) return '??';
    return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase();
  }
}
