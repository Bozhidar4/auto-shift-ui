import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { Team } from '../../models/team';
import { ScheduleAssignment } from '../../models/schedule-assignment.interface';
import { ShiftType } from '../../models/shift-type.interface';
import { Employee } from '../../models/employee.interface';
import { ScheduleAssignmentUpdateDto } from '../../models/schedule-assignment-update.interface';
import { GeneratedSchedule } from '../../models/schedule-generated.interface';

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmComponent],
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss']
})
export class SchedulesComponent implements OnInit {
  schedule: GeneratedSchedule | null = null;
  teams: Team[] = [];
  selectedTeamId: number | null = null;
  startDate: string | null = null;
  endDate: string | null = null;
  schedules: GeneratedSchedule[] = [];
  editingMap: Record<string, { editing: boolean; tempEndDate?: string; saving?: boolean }> = {};
  // Viewing (modal) state
  viewingSchedule: GeneratedSchedule | null = null;
  // Available shift types for selected team
  shiftTypes: ShiftType[] = [];
  // Cached team employees to resolve names quickly
  teamEmployees: Employee[] = [];
  // Table model: employees array and dates array, and cells map by employeeId/date -> assignment
  tableEmployees: any[] = [];
  tableDates: string[] = [];
  tableCells: Record<string, any> = {};
  // temporary models for creating empty cells before saving
  emptyCellModel: Record<string, any> = {};
  // confirm dialog state
  confirmState: { visible: boolean; title: string | null; message: string | null; target?: any } = { visible: false, title: null, message: null };

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.apiService.getTeams().subscribe(t => this.teams = t || []);
  }

  onTeamChange(): void {
    if (!this.selectedTeamId) {
      this.schedules = [];
      return;
    }
    // preload employees and shift types for the team for smoother UI
    this.apiService.listEmployees(this.selectedTeamId).subscribe(e => this.teamEmployees = e || []);
    this.apiService.getShiftTypes(this.selectedTeamId).subscribe(t => this.shiftTypes = t || []);
    this.loadSchedules(this.selectedTeamId);
  }

  loadSchedules(
    teamId: number
  ): void {
    this.apiService.getSchedules(teamId).subscribe((schedule: GeneratedSchedule[]) => {
      this.schedules = (schedule || []).map((mappedSchedule: GeneratedSchedule) => ({ ...mappedSchedule }));
      // initialize editing map
      this.editingMap = {};
      this.schedules.forEach(schedule => {
        this.editingMap[schedule.id] = {
          editing: false,
          tempEndDate: schedule.endDate ? schedule.endDate.split('T')[0] : undefined
        };
      });
      // also load shift types for team to be ready for viewing
      if (teamId) {
        this.apiService.getShiftTypes(teamId).subscribe(t => this.shiftTypes = t || []);
      }
    });
  }

  generate(): void {
    if (!this.selectedTeamId || !this.startDate || !this.endDate) {
      return;
    }

    const model: GeneratedSchedule = {
      id: 0,
      teamId: `${this.selectedTeamId}`,
      startDate: new Date(this.startDate).toISOString(),
      endDate: new Date(this.endDate).toISOString(),
      assignments: []
    };

    this.apiService.generateScheduleRequest(model).subscribe({
      next: (schedule: GeneratedSchedule) => {
        this.schedule = schedule;
        this.toastService.show('Schedule generated', 'success');
        // reload schedules for selected team so it appears in the list
        if (this.selectedTeamId) {
          this.loadSchedules(this.selectedTeamId);
        }
      },
      error: (error) => {
        this.toastService.show('Failed to generate schedule', 'error');
      }
    });
  }

  download(): void {
    if (!this.schedule) {
      return;
    }

    const blob = new Blob([JSON.stringify(this.schedule, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const htmlAnchorElement = document.createElement('a');
    htmlAnchorElement.href = url;
    htmlAnchorElement.download = 'schedule.json';
    htmlAnchorElement.click();
    URL.revokeObjectURL(url);
  }

  // isEditable(
  //   schedule: GeneratedSchedule
  // ): boolean {
  //   if (!schedule || !schedule.endDate) {
  //     return false;
  //   }

  //   const end = new Date(schedule.endDate);
  //   const today = new Date();
  //   // If end date is in the future (strictly greater than today), allow editing
  //   return end.setHours(0, 0, 0, 0) > today.setHours(0, 0, 0, 0);
  // }

  // startEdit(
  //   schedule: GeneratedSchedule
  // ): void {
  //   if (!this.isEditable(schedule)) {
  //     return;
  //   }

  //   this.editingMap[schedule.id].editing = true;
  //   this.editingMap[schedule.id].tempEndDate = schedule.endDate ? schedule.endDate.split('T')[0] : undefined;
  // }

  // cancelEdit(
  //   schedule: GeneratedSchedule
  // ): void {
  //   this.editingMap[schedule.id].editing = false;
  //   this.editingMap[schedule.id].tempEndDate = schedule.endDate ? schedule.endDate.split('T')[0] : undefined;
  // }

  // saveSchedule(
  //   schedule: GeneratedSchedule
  // ): void {
  //   const metaData = this.editingMap[schedule.id];

  //   if (!metaData || !metaData.tempEndDate) {
  //     return;
  //   }

  //   metaData.saving = true;
  //   const payload = { 
  //     ...schedule, 
  //     endDate: new Date(metaData.tempEndDate)?.toISOString() 
  //   };

  //   this.apiService.updateSchedule(schedule.id, payload).subscribe({
  //     next: (result) => {
  //       metaData.saving = false;
  //       metaData.editing = false;
  //       schedule.endDate = payload.endDate;
  //       this.toastService.show('Schedule saved', 'success');
  //     },
  //     error: (error) => {
  //       metaData.saving = false;
  //       this.toastService.show('Failed to save schedule', 'error');
  //     }
  //   });
  // }

  deleteScheduleConfirm(
    schedule: GeneratedSchedule
  ): void {
    this.confirmState = {
      visible: true,
      title: 'Delete schedule',
      message: `Delete schedule ${schedule.id}? This cannot be undone.`,
      target: schedule
    };
  }

  // called when confirm component emits confirmed
  onConfirmedDelete(): void {
    const schedule = this.confirmState.target;
    this.confirmState.visible = false;

    if (!schedule) {
      return;
    }

    this.apiService
      .deleteSchedule(schedule.id)
      .subscribe({
        next: () => {
          this.loadSchedules(this.selectedTeamId!); this.toastService.show('Schedule deleted', 'success');
          this.schedules = this.schedules.filter(x => x.id !== schedule.id);
        },
        error: () => {
          this.toastService.show('Failed to delete schedule', 'error');
        }
      });
  }

  onCancelledDelete(): void {
    this.confirmState.visible = false;
  }

  // Open view modal — build table model
  viewSchedule(
    schedule: GeneratedSchedule
  ): void {
    // fetch full schedule details to ensure assignments are loaded
    this.apiService.getSchedule(schedule.id).subscribe({
      next: (full: GeneratedSchedule) => this.buildViewTable(full || schedule),
      error: () => this.buildViewTable(schedule)
    });
  }

  private buildViewTable(
    schedule: GeneratedSchedule
  ): void {
    this.viewingSchedule = schedule;
    // Normalize assignments (handle $values wrapper)
    let assignments = schedule.assignments || [];
    if (assignments && (assignments as any).$values && Array.isArray((assignments as any).$values)) assignments = (assignments as any).$values;
    assignments = assignments || [];

    // After view model built, schedule a column-width adjustment so columns are at least header width
    setTimeout(() => this.adjustColumnWidths?.(), 50);
    // Build full date range from schedule startDate..endDate (inclusive)
    const dateSet = new Set<string>();
    if (schedule.startDate && schedule.endDate) {
      const start = new Date(schedule.startDate);
      const end = new Date(schedule.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dateSet.add(this.toLocalDateKey(d));
      }
    } else {
      // fallback: collect dates from assignments
      assignments.forEach((assignment: ScheduleAssignment) => {
        if (assignment && (assignment.date)) {
          dateSet.add(this.toLocalDateKey(assignment.date));
        }
      });
    }

    // Build employees list from assignments (ids only); we'll try to resolve names by fetching team employees
    const empMap: Record<string, any> = {};
    assignments.forEach((assignment: ScheduleAssignment) => {
      const employeeId = assignment.employeeId;
      if (employeeId == null) {
        return;
      }
      if (!empMap[String(employeeId)]) {
        // try to find the employee name from preloaded teamEmployees
        const found = this.teamEmployees.find(employee => String(employee.id) === String(employeeId));
        const name = found ? `${found.firstName} ${found.lastName}`.trim() : String(employeeId);
        empMap[String(employeeId)] = { id: employeeId, name };
      }
    });

    // // If there are no assignments but the API provided employees list, include them
    // const schEmps = schedule.employees || schedule.Employees || [];
    // if (Array.isArray(schEmps) && schEmps.length) {
    //   schEmps.forEach((e: any) => {
    //     const id = e.id ?? e.Id ?? e.employeeId ?? e.EmployeeId;
    //     const name = e.name ?? e.Name ?? e.employeeName ?? e.EmployeeName ?? String(id);
    //     if (id != null) empMap[String(id)] = { id, name };
    //   });
    // }

    this.tableDates = Array.from(dateSet).sort();
    this.tableEmployees = Object.values(empMap);

    // build cells map
    this.tableCells = {};
    assignments.forEach((assignment: ScheduleAssignment) => {
      const employeeId = assignment.employeeId;
      const shiftTypeId = assignment.shiftTypeId ?? null;
      const dateStrRaw = (assignment.date ?? '').toString();
      const dateKey = this.toLocalDateKey(dateStrRaw);
      const key = `${employeeId}__${dateKey}`;
      this.tableCells[key] = {
        ...assignment,
        employeeId,
        shiftTypeId,
        date: dateKey
      };
    });
    // Prefer names from preloaded teamEmployees (already applied above)
    this.tableEmployees = Object.values(empMap);

    // // If any employee entries lack proper names, fetch employee list and map names
    // const missing = this.tableEmployees.filter((e: any) => !e.name || String(e.name).match(/^\d+$/));
    // if (missing.length > 0) {
    //   const ensureNames = (emps: any[]) => {
    //     const byId: Record<string, any> = {};
    //     (emps || []).forEach((ee: any) => {
    //       const id = ee.id ?? ee.Id ?? ee.employeeId ?? ee.EmployeeId;
    //       if (id != null) byId[String(id)] = ee;
    //     });
    //     let updated = false;
    //     this.tableEmployees.forEach((te: any) => {
    //       const found = byId[String(te.id)];
    //       if (found && (found.name || found.firstName || found.fullName)) {
    //         te.name = (found.name ?? `${found.firstName ?? ''} ${found.lastName ?? ''}`.trim()) || te.name;
    //         updated = true;
    //       }
    //     });
    //     // also update any existing tableCells employeeName
    //     Object.keys(this.tableCells).forEach(k => {
    //       const c = this.tableCells[k];
    //       const id = String(c.employeeId);
    //       if (byId[id]) {
    //         const f = byId[id];
    //         c.employeeName = (f.name ?? `${f.firstName ?? ''} ${f.lastName ?? ''}`.trim()) || c.employeeName;
    //       }
    //     });
    //     if (updated) this.tableEmployees = [...this.tableEmployees];
    //   };

    //   // If we have a selected team, use preloaded teamEmployees (already available) else load all employees
    //   if (this.teamEmployees && this.teamEmployees.length) {
    //     ensureNames(this.teamEmployees);
    //   } else {
    //     this.apiService.listEmployees().subscribe(emps => ensureNames(emps || []));
    //   }
    // }
    // ensure shift types loaded
    if (!this.shiftTypes || !this.shiftTypes.length) {
      if (this.selectedTeamId) {
        this.apiService.getShiftTypes(this.selectedTeamId).subscribe(t => this.shiftTypes = t || []);
      }
    }
  }

  // Format the date header as '16 Oct 2025'
  formatDateHeader(
    dateIso: string
  ): string {
    if (!dateIso) {
      return '';
    }

    const date = new Date(dateIso);
    const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString(undefined, opts);
  }

  // Normalize a Date or ISO date string to local YYYY-MM-DD to avoid UTC offset shifts
  toLocalDateKey(
    dateInput: string | Date
  ): string {
    if (!dateInput) {
      return '';
    }

    const date = new Date(dateInput);
    // Build local YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Ensure each table column is at least as wide as its header text; allow expansion if content is larger
  adjustColumnWidths(): void {
    try {
      const table = document.querySelector('.view-table') as HTMLTableElement | null;
      if (!table) return;
      const thead = table.tHead;
      if (!thead) return;
      const headerRow = thead.rows[0];
      if (!headerRow) return;

      // Ensure colgroup exists and has correct number of cols
      let colgroup = table.querySelector('colgroup');
      const colsNeeded = headerRow.cells.length;
      if (!colgroup) {
        colgroup = document.createElement('colgroup');
        for (let i = 0; i < colsNeeded; i++) colgroup.appendChild(document.createElement('col'));
        table.insertBefore(colgroup, table.firstChild!);
      } else {
        // Adjust number of cols
        while (colgroup.children.length < colsNeeded) colgroup.appendChild(document.createElement('col'));
        while (colgroup.children.length > colsNeeded) colgroup.removeChild(colgroup.lastChild!);
      }

      // For each header cell, measure its scrollWidth and set the corresponding col width
      for (let i = 0; i < headerRow.cells.length; i++) {
        const th = headerRow.cells[i] as HTMLTableCellElement;
        const col = colgroup.children[i] as HTMLTableColElement;
        // Use scrollWidth to include content width; add small padding buffer
        const w = Math.max(30, th.scrollWidth + 12);
        col.style.width = `${w}px`;
      }
    } catch (e) {
      console.warn('adjustColumnWidths failed', e);
    }
  }

  // Create an empty cell model and save it as a new assignment
  createEmptyCellAndSave(
    employeeId: string | number,
    date: string
  ): void {
    const key = `${employeeId}__${date}`;
    const selected = this.emptyCellModel[key];
    const newShiftTypeId = selected ? Number(selected) : null;
    // Create a local cell so UI shows selection during save
    const emp = this.tableEmployees.find(e => String(e.id) === String(employeeId));
    const cell = {
      employeeId: Number(employeeId),
      employeeName: emp ? emp.name : String(employeeId),
      shiftTypeId: newShiftTypeId,
      date: date
    };
    this.tableCells[key] = cell;

    this.saveCell(String(employeeId), date);
    // clear temp model
    delete this.emptyCellModel[key];
  }

  closeView(): void {
    this.viewingSchedule = null;
    this.tableEmployees = [];
    this.tableDates = [];
    this.tableCells = {};
  }

  // Save single cell change (assignment) — calls updateAssignment
  saveCell(
    employeeId: string,
    date: string
  ): void {
    const key = `${employeeId}__${date}`;
    const cell = this.tableCells[key];
    if (!cell || this.isPastDate(date)) {
      return;
    }

    const scheduleId = this.viewingSchedule?.id;

    if (!scheduleId) {
      return;
    }

    const dto: ScheduleAssignmentUpdateDto = {
      employeeId: Number(cell.employeeId),
      date: new Date(date),
      newShiftTypeId: cell.shiftTypeId ? Number(cell.shiftTypeId) : 0
    };
    // call patchAssignment on the schedule
    this.apiService.patchAssignment(scheduleId, dto).subscribe({
      next: (response: any) => {
        // if server returned a created object, use its id; if returned Ok(existing) use it; if NoContent (delete) we'll remove from table
        if (!dto.newShiftTypeId) {
          // deletion: remove cell
          delete this.tableCells[`${employeeId}__${date}`];
        } else if (response && response.id) {
          // creation or update returned the assignment
          this.tableCells[`${employeeId}__${date}`] = { ...response };
        } else {
          // best-effort: update the local cell shiftTypeId
          this.tableCells[`${employeeId}__${date}`].shiftTypeId = dto.newShiftTypeId;
        }
        this.toastService.show('Assignment saved', 'success');
      },
      error: (error) => {
        this.toastService.show('Failed to save assignment', 'error');
      }
    });
  }

  isPastDate(
    dateIso: string
  ): boolean {
    const date = new Date(dateIso);
    const today = new Date();
    return date.setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0);
  }
}
