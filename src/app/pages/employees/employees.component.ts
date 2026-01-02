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

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmComponent, MatIconModule],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
  employees: EmployeeRow[] = [];
  teams: Team[] = [];
  confirmState: ConfirmState = { visible: false, title: '', message: '', target: null as any };

  constructor(
    private api: ApiService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.api.getTeams().subscribe((t) => {
      (
        this.teams = t.filter(team => team.name !== null).map(team => ({
          id: team.id,
          name: team.name ?? ''
        }))
      );
      this.load();
    });
  }

  load(): void {
    this.api.listEmployees().subscribe((list: Employee[]) => {
      this.employees = list.map((e) => ({
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

  edit(
    row: EmployeeRow
  ): void {
    row._editing = true;
  }

  cancel(
    row: EmployeeRow
  ): void {
    row._editing = false;
  }

  save(
    row: EmployeeRow
  ): void {
    if (!row) {
      return;
    }

    const model: Employee = {
      firstName: row.firstName,
      lastName: row.lastName,
      monthlyHoursTarget: row.monthlyHoursTarget,
      isActive: row.isActive,
      teamId: row.teamId || null,
      id: row.id || 0
    };
    debugger
    if (model.id) {
      this.api.updateEmployee(model.id, model).subscribe(() => {
        row._editing = false;
        this.load();
        this.toastService.show('Employee updated successfully.', 'success');
      },
        (error) => {
          this.toastService.show('Failed to update employee.', 'error');
        });
    } else {
      this.api.createEmployee(model).subscribe(() => {
        this.load();
        this.toastService.show('Employee created successfully.', 'success');
      },
        (error) => {
          this.toastService.show('Failed to create employee.', 'error');
        });
    }
  }

  remove(
    row: EmployeeRow
  ): void {
    if (!row.id) {
      this.employees = this.employees.filter((r) => r !== row);
      return;
    }

    this.confirmState = {
      visible: true,
      title: 'Delete employee',
      message: `Delete employee ${row.firstName} ${row.lastName}?`,
      target: row
    };
  }

  onConfirmedRemove(): void {
    const row: EmployeeRow = this.confirmState.target;
    if (!row || !row.id) {
      return;
    }

    this.api.deleteEmployee(row.id).subscribe(() => {
      this.load();
      this.toastService.show('Employee deleted successfully.', 'success');
    },
      (error) => {
        this.toastService.show('Failed to delete employee.', 'error');
      });
    this.confirmState.visible = false;
    this.confirmState.target = null;
  }

  onCancelledRemove(): void {
    this.confirmState.visible = false;
    this.confirmState.target = null;
  }
}
