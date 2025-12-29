import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Employee } from '../../models/employee.interface';
import { createEmptyEmployeeLeave, EmployeeLeave } from '../../models/employee-leave.interface';
import { createEmptyLeaveType, LeaveType } from '../../models/leave-type.interface';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaves.component.html',
  styleUrls: ['./leaves.component.scss']
})
export class LeavesComponent implements OnInit {
  employees: Employee[] = [];
  selectedEmployeeId: number | null = null;
  leaves: EmployeeLeave[] = [];
  leaveTypes: LeaveType[] = [];
  newLeave: EmployeeLeave = createEmptyEmployeeLeave();
  newLeaveType: LeaveType = createEmptyLeaveType();
  showLeaveTypeManager: boolean = false;
  editingLeaveId: number | null = null;
  editLeaveModel: EmployeeLeave = createEmptyEmployeeLeave();
  // leave types inline edit
  editingLeaveTypeId: number | null = null;
  editLeaveTypeModel: LeaveType = createEmptyLeaveType();

  constructor(
    private apiService: ApiService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.loadEmployees(true);
  }

  loadEmployees(
    triggerNext: boolean = false
  ) {
    const observable = this.apiService.listEmployees().pipe(
      tap((e: Employee[]) => this.employees = e || []),
      catchError((err) => {
        this.employees = []; this.toast.show('Failed to load employees', 'error'); return of([]);
      })
    );

    observable.subscribe(() => {
      if (triggerNext) {
        this.loadLeaveTypes();
        this.loadLeaves();
      }
    });

    return observable;
  }

  loadLeaves(): void {
    if (!this.selectedEmployeeId) {
      this.leaves = [];
      return;
    }

    this.apiService.listEmployeeLeaves(this.selectedEmployeeId).subscribe({ next: (leave: EmployeeLeave[]) => this.leaves = leave || [] });
  }

  loadLeaveTypes(): void {
    this.apiService.getLeaveTypes().subscribe({
      next: (leaveType: LeaveType[]) => this.leaveTypes = leaveType || []
    });
  }

  createLeave(): void {
    if (!this.newLeave) {
      return;
    }

    this.apiService.createEmployeeLeave(this.newLeave).subscribe({
      next: (result) => {
        this.newLeave = createEmptyEmployeeLeave();
        this.loadLeaves();
      }
    });
  }

  deleteLeave(
    leave: EmployeeLeave
  ): void {
    if (!confirm('Delete leave?')) {
      return;
    }

    this.apiService
      .deleteEmployeeLeave(leave.id)
      .subscribe({ next: () => this.loadLeaves() });
  }

  startEditLeave(
    leave: EmployeeLeave
  ): void {
    this.editingLeaveId = leave.id;
    this.editLeaveModel = {
      id: leave.id,
      employeeId: leave.employeeId || leave.employee?.id || 0,
      leaveTypeId: leave.leaveTypeId || leave.leaveType?.id || 0,
      startDate: leave.startDate,
      endDate: leave.endDate,
      notes: leave.notes
    };
  }

  cancelEditLeave(): void {
    this.editingLeaveId = null;
    this.editLeaveModel = createEmptyEmployeeLeave();
  }

  canSaveLeave(): boolean {
    if (!this.editLeaveModel
      || !this.editLeaveModel.employeeId
      || !this.editLeaveModel.leaveTypeId
      || !this.editLeaveModel.startDate) {
      return false;
    }

    return true;
  }

  saveEditLeave(): void {
    if (!this.editLeaveModel || !this.canSaveLeave()) {
      return;
    }

    const id = this.editLeaveModel.id;
    const payload = {
      id: this.editLeaveModel.id,
      employeeId: this.editLeaveModel.employeeId,
      leaveTypeId: this.editLeaveModel.leaveTypeId,
      startDate: this.editLeaveModel.startDate,
      endDate: this.editLeaveModel.endDate,
      notes: this.editLeaveModel.notes
    };

    this.apiService
      .updateEmployeeLeave(id, payload)
      .subscribe({ next: () => { this.cancelEditLeave(); this.loadLeaves(); } });
  }

  createLeaveType(): void {
    this.apiService.createLeaveType(this.newLeaveType).subscribe({
      next: (type) => {
        this.newLeaveType = createEmptyLeaveType();
        this.loadLeaveTypes();
      }
    });
  }

  createEmptyLeaveType(): LeaveType {
    return createEmptyLeaveType();
  }

  deleteLeaveType(
    leaveType: LeaveType
  ): void {
    if (!confirm('Delete leave type?')) {
      return;
    }

    this.apiService
      .deleteLeaveType(leaveType.id)
      .subscribe({ next: () => this.loadLeaveTypes() });
  }

  startEditLeaveType(
    leaveType: LeaveType
  ): void {
    this.editingLeaveTypeId = leaveType.id;
    this.editLeaveTypeModel = {
      id: leaveType.id,
      name: leaveType.name,
      description: leaveType.description
    };
  }

  cancelEditLeaveType(): void {
    this.editingLeaveTypeId = null;
    this.editLeaveTypeModel = createEmptyLeaveType();
  }

  saveEditLeaveType(): void {
    if (!this.editLeaveTypeModel || !this.editLeaveTypeModel.name) {
      return;
    }

    const payload = {
      id: this.editLeaveTypeModel.id,
      name: this.editLeaveTypeModel.name,
      description: this.editLeaveTypeModel.description
    };

    this.apiService
      .updateLeaveType(payload)
      .subscribe({
        next: () => {
          this.cancelEditLeaveType();
          this.loadLeaveTypes();
        }
      });
  }
}
