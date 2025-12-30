import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { DateUtilsService } from '../../services/date-utils.service';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Employee } from '../../models/employee.interface';
import { createEmptyEmployeeLeave, EmployeeLeave, EmployeeLeaveDto } from '../../models/employee-leave.interface';
import { createEmptyLeaveType, LeaveType } from '../../models/leave-type.interface';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { ConfirmState } from '../../models/confirm-state.interface';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmComponent],
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
  confirmState: ConfirmState = { visible: false, title: '', message: '', target: null };

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private dateUtilsService: DateUtilsService
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
        this.employees = []; this.toastService.show('Failed to load employees', 'error'); return of([]);
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

    this.apiService
      .listEmployeeLeaves(this.selectedEmployeeId)
      .subscribe({
        next: (leave: EmployeeLeave[]) => this.leaves = leave || [],
        error: () => {
          this.leaves = [];
          this.toastService.show('Failed to load leaves', 'error');
        }
      });
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

    // Ensure dates are Date objects to match EmployeeLeave model
    const createPayload = {
      id: this.newLeave.id,
      employeeId: this.newLeave.employeeId,
      leaveTypeId: this.newLeave.leaveTypeId,
      startDate: this.dateUtilsService.toApiDate((this.newLeave as any).startDate),
      endDate: this.dateUtilsService.toApiDate((this.newLeave as any).endDate),
      notes: this.newLeave.notes
    } as EmployeeLeaveDto;

    this.apiService
      .createEmployeeLeave(createPayload)
      .subscribe({
        next: (result) => {
          this.newLeave = createEmptyEmployeeLeave();
          this.loadLeaves();
          this.toastService.show('Leave created successfully.', 'success');
        },
        error: () => {
          this.toastService.show('Failed to create leave.', 'error');
        }
      });
  }

  deleteLeave(
    leave: EmployeeLeave
  ): void {
    this.confirmState = {
      visible: true,
      title: 'Delete leave',
      message: 'Delete leave?',
      target: leave
    };
  }

  startEditLeave(
    leave: EmployeeLeave
  ): void {
    this.editingLeaveId = leave.id;
    this.editLeaveModel = {
      id: leave.id,
      employeeId: leave.employeeId ?? leave.employee?.id ?? null,
      leaveTypeId: leave.leaveTypeId ?? leave.leaveType?.id ?? null,
      startDate: this.dateUtilsService.toInputDate(leave.startDate),
      endDate: this.dateUtilsService.toInputDate(leave.endDate),
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
      startDate: this.dateUtilsService.toApiDate((this.editLeaveModel).startDate),
      endDate: this.dateUtilsService.toApiDate((this.editLeaveModel).endDate),
      notes: this.editLeaveModel.notes
    } as EmployeeLeaveDto;

    this.apiService
      .updateEmployeeLeave(id, payload)
      .subscribe({
        next: () => {
          this.cancelEditLeave();
          this.loadLeaves();
          this.toastService.show('Leave updated successfully.', 'success');
        },
        error: () => {
          this.toastService.show('Failed to update leave.', 'error');
        }
      });
  }

  createLeaveType(): void {
    this.apiService
      .createLeaveType(this.newLeaveType)
      .subscribe({
        next: (type) => {
          this.newLeaveType = createEmptyLeaveType();
          this.loadLeaveTypes();
          this.toastService.show('Leave type created successfully.', 'success');
        },
        error: () => {
          this.toastService.show('Failed to create leave type.', 'error');
        }
      });
  }

  createEmptyLeaveType(): LeaveType {
    return createEmptyLeaveType();
  }

  deleteLeaveType(
    leaveType: LeaveType
  ): void {
    this.confirmState = {
      visible: true,
      title: 'Delete leave type',
      message: 'Delete leave type?',
      target: leaveType
    };
  }

  onConfirmedDelete(): void {
    const payload = this.confirmState.target;
    if (!payload) {
      return;
    }

    // distinguish by presence of id properties
    if ((payload as EmployeeLeave).startDate !== undefined) {
      const leave = payload as EmployeeLeave;
      this.apiService.deleteEmployeeLeave(leave.id).subscribe({
        next: () => {
          this.loadLeaves();
          this.toastService.show('Leave deleted successfully.', 'success');
        },
        error: () => {
          this.toastService.show('Failed to delete leave.', 'error');
        }
      });
    } else {
      const leaveType = payload as LeaveType;
      this.apiService.deleteLeaveType(leaveType.id).subscribe({
        next: () => {
          this.loadLeaveTypes();
          this.toastService.show('Leave type deleted successfully.', 'success');
        },
        error: () => {
          this.toastService.show('Failed to delete leave type.', 'error');
        }
      });
    }

    this.confirmState.visible = false;
    this.confirmState.target = null;
  }

  onCancelledDelete(): void {
    this.confirmState.visible = false;
    this.confirmState.target = null;
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
          this.toastService.show('Leave type updated successfully.', 'success');
        },
        error: () => {
          this.toastService.show('Failed to update leave type.', 'error');
        }
      });
  }

  onEmployeeSelect(
    employeeId: number | null
  ): void {
    this.selectedEmployeeId = employeeId;
    this.loadLeaves();
  }
  // Date helpers moved to DateUtilsService
}
