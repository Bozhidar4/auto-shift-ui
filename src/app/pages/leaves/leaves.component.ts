import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaves.component.html',
  styleUrls: ['./leaves.component.scss']
})
export class LeavesComponent implements OnInit {
  employees: any[] = [];
  selectedEmployeeId: number | null = null;
  leaves: any[] = [];
  leaveTypes: any[] = [];
  newLeave: any = { employeeId: null, leaveTypeId: null, startDate: '', endDate: '', notes: '' };
  newLeaveType: any = { name: '', description: '' };
  showLeaveTypeManager = false;
  editingLeaveId: number | null = null;
  editLeaveModel: any = null;
  // leave types inline edit
  editingLeaveTypeId: number | null = null;
  editLeaveTypeModel: any = null;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    // Load employees first, then load leave types and leaves
    this.loadEmployees(true);
  }

  loadEmployees(triggerNext: boolean = false) {
    const obs = this.api.listEmployees().pipe(
      tap((e: any) => this.employees = e || []),
      catchError((err: any) => { this.employees = []; this.toast.show('Failed to load employees', 'error'); return of([]); })
    );

    const sub = obs.subscribe(() => {
      if (triggerNext) {
        this.loadLeaveTypes();
        this.loadLeaves();
      }
    });

    return obs;
  }

  loadLeaves() {
    const id = this.selectedEmployeeId;
    this.api.listEmployeeLeaves(id || undefined).subscribe({ next: (l:any) => this.leaves = l || [] });
  }

  loadLeaveTypes() {
    this.api.getLeaveTypes().subscribe({ next: (t:any) => this.leaveTypes = t || [] });
  }

  createLeave() {
    const payload = { ...this.newLeave };
    this.api.createEmployeeLeave(payload).subscribe({ next: (res:any) => { this.newLeave = { employeeId: null, leaveTypeId: null, startDate: '', endDate: '', notes: '' }; this.loadLeaves(); } });
  }

  deleteLeave(l: any) {
    if (!confirm('Delete leave?')) return;
    this.api.deleteEmployeeLeave(l.id).subscribe({ next: () => this.loadLeaves() });
  }

  startEditLeave(l: any) {
    this.editingLeaveId = l.id;
    this.editLeaveModel = {
      id: l.id,
      employeeId: l.employeeId || l.employee?.id,
      leaveTypeId: l.leaveTypeId || l.leaveType?.id,
      startDate: l.startDate,
      endDate: l.endDate,
      notes: l.notes
    };
  }

  cancelEditLeave() {
    this.editingLeaveId = null;
    this.editLeaveModel = null;
  }

  canSaveLeave(): boolean {
    if (!this.editLeaveModel) return false;
    if (!this.editLeaveModel.employeeId) return false;
    if (!this.editLeaveModel.leaveTypeId) return false;
    if (!this.editLeaveModel.startDate) return false;
    return true;
  }

  saveEditLeave() {
    if (!this.editLeaveModel || !this.canSaveLeave()) return;
    const id = this.editLeaveModel.id;
    const payload = {
      employeeId: this.editLeaveModel.employeeId,
      leaveTypeId: this.editLeaveModel.leaveTypeId,
      startDate: this.editLeaveModel.startDate,
      endDate: this.editLeaveModel.endDate,
      notes: this.editLeaveModel.notes
    };
    this.api.updateEmployeeLeave(id, payload).subscribe({ next: () => { this.cancelEditLeave(); this.loadLeaves(); } });
  }

  // Leave types manager
  createLeaveType() {
    this.api.createLeaveType(this.newLeaveType).subscribe({ next: (t:any) => { this.newLeaveType = { name: '', description: '' }; this.loadLeaveTypes(); } });
  }

  deleteLeaveType(t: any) {
    if (!confirm('Delete leave type?')) return;
    this.api.deleteLeaveType(t.id).subscribe({ next: () => this.loadLeaveTypes() });
  }

  startEditLeaveType(t: any) {
    this.editingLeaveTypeId = t.id;
    this.editLeaveTypeModel = { id: t.id, name: t.name, description: t.description };
  }

  cancelEditLeaveType() {
    this.editingLeaveTypeId = null;
    this.editLeaveTypeModel = null;
  }

  saveEditLeaveType() {
    if (!this.editLeaveTypeModel || !this.editLeaveTypeModel.name) return;
    const id = this.editLeaveTypeModel.id;
    const payload = { name: this.editLeaveTypeModel.name, description: this.editLeaveTypeModel.description };
    this.api.updateLeaveType(id, payload).subscribe({ next: () => { this.cancelEditLeaveType(); this.loadLeaveTypes(); } });
  }
}
