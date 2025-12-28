import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { Team } from '../../models/team';

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmComponent],
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss']
})
export class SchedulesComponent implements OnInit {
  schedule: any | null = null;
  teams: Team[] = [];
  selectedTeamId: number | null = null;
  startDate: string | null = null;
  endDate: string | null = null;
  schedules: any[] = [];
  editingMap: Record<string, { editing: boolean; tempEndDate?: string; saving?: boolean }> = {};
  // Viewing (modal) state
  viewingSchedule: any | null = null;
  // Available shift types for selected team
  shiftTypes: any[] = [];
  // Cached team employees to resolve names quickly
  teamEmployees: any[] = [];
  // Table model: employees array and dates array, and cells map by employeeId/date -> assignment
  tableEmployees: any[] = [];
  tableDates: string[] = [];
  tableCells: Record<string, any> = {};
  // temporary models for creating empty cells before saving
  emptyCellModel: Record<string, any> = {};
  // confirm dialog state
  confirmState: { visible: boolean; title: string | null; message: string | null; target?: any } = { visible: false, title: null, message: null };

  constructor(private api: ApiService, private toasts: ToastService) { }

  ngOnInit() {
    this.api.getTeams().subscribe(t => this.teams = t || []);
  }

  onTeamChange() {
    if (!this.selectedTeamId) {
      this.schedules = [];
      return;
    }
    // preload employees and shift types for the team for smoother UI
    this.api.listEmployees(this.selectedTeamId).subscribe(e => this.teamEmployees = e || []);
    this.api.getShiftTypes(this.selectedTeamId).subscribe(t => this.shiftTypes = t || []);
    this.loadSchedules(this.selectedTeamId);
  }

  loadSchedules(teamId: number) {
    this.api.getSchedules(teamId).subscribe((s: any) => {
      this.schedules = (s || []).map((sch: any) => ({ ...sch }));
      // initialize editing map
      this.editingMap = {};
      this.schedules.forEach(sch => {
        this.editingMap[sch.id] = { editing: false, tempEndDate: sch.endDate ? sch.endDate.split('T')[0] : undefined };
      });
      // also load shift types for team to be ready for viewing
      if (teamId) {
        this.api.getShiftTypes(teamId).subscribe(t => this.shiftTypes = t || []);
      }
    });
  }

  generate() {
    if (!this.selectedTeamId || !this.startDate || !this.endDate) return;
    const model = { TeamId: this.selectedTeamId, StartDate: new Date(this.startDate).toISOString(), EndDate: new Date(this.endDate).toISOString() };
    this.api.generateScheduleRequest(model).subscribe({
      next: (s: any) => {
        this.schedule = s;
        this.toasts.show('Schedule generated', 'success');
        // reload schedules for selected team so it appears in the list
        if (this.selectedTeamId) this.loadSchedules(this.selectedTeamId);
      },
      error: (err: any) => {
        console.error('Generate failed', err);
        this.toasts.show('Failed to generate schedule', 'error');
      }
    });
  }

  download() {
    if (!this.schedule) return;
    const blob = new Blob([JSON.stringify(this.schedule, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Helpers for editing schedules
  isEditable(sch: any) {
    if (!sch || !sch.endDate) return false;
    const end = new Date(sch.endDate);
    const today = new Date();
    // If end date is in the future (strictly greater than today), allow editing
    return end.setHours(0, 0, 0, 0) > today.setHours(0, 0, 0, 0);
  }

  startEdit(sch: any) {
    if (!this.isEditable(sch)) return;
    this.editingMap[sch.id].editing = true;
    this.editingMap[sch.id].tempEndDate = sch.endDate ? sch.endDate.split('T')[0] : undefined;
  }

  cancelEdit(sch: any) {
    this.editingMap[sch.id].editing = false;
    this.editingMap[sch.id].tempEndDate = sch.endDate ? sch.endDate.split('T')[0] : undefined;
  }

  saveSchedule(sch: any) {
    const meta = this.editingMap[sch.id];
    if (!meta) return;
    if (!meta.tempEndDate) return;
    meta.saving = true;
    const payload = { ...sch, endDate: new Date(meta.tempEndDate).toISOString() };
    this.api.updateSchedule(sch.id, payload).subscribe({
      next: (res: any) => {
        meta.saving = false;
        meta.editing = false;
        sch.endDate = payload.endDate;
        this.toasts.show('Schedule saved', 'success');
      },
      error: (err: any) => {
        meta.saving = false;
        console.error('Failed to save schedule', err);
        this.toasts.show('Failed to save schedule', 'error');
      }
    });
  }

  // Delete schedule with confirmation
  deleteScheduleConfirm(sch: any) {
    // show in-app confirm dialog
    this.confirmState = { visible: true, title: 'Delete schedule', message: `Delete schedule ${sch.id}? This cannot be undone.`, target: sch };
  }

  // called when confirm component emits confirmed
  onConfirmedDelete() {
    const sch = this.confirmState.target;
    this.confirmState.visible = false;
    if (!sch) return;
    if ((this.api as any).deleteSchedule) {
      (this.api as any).deleteSchedule(sch.id).subscribe({ next: () => { this.loadSchedules(this.selectedTeamId!); this.toasts.show('Schedule deleted', 'success'); }, error: () => { this.toasts.show('Failed to delete schedule', 'error'); } });
    } else {
      this.schedules = this.schedules.filter(x => x.id !== sch.id);
    }
  }

  onCancelledDelete() {
    this.confirmState.visible = false;
  }

  // Open view modal — build table model
  viewSchedule(sch: any) {
    // fetch full schedule details to ensure assignments are loaded
    this.api.getSchedule(sch.id).subscribe({
      next: (full: any) => this.buildViewTable(full || sch),
      error: () => this.buildViewTable(sch)
    });
  }

  private buildViewTable(sch: any) {
    this.viewingSchedule = sch;
    // Normalize assignments (handle $values wrapper)
    let assignments = sch.assignments || sch.Assignments || [];
    if (assignments && (assignments as any).$values && Array.isArray((assignments as any).$values)) assignments = (assignments as any).$values;
    assignments = assignments || [];

    // After view model built, schedule a column-width adjustment so columns are at least header width
    setTimeout(() => this.adjustColumnWidths?.(), 50);
    // Build full date range from schedule startDate..endDate (inclusive)
    const dateSet = new Set<string>();
    if (sch.startDate && sch.endDate) {
      const start = new Date(sch.startDate);
      const end = new Date(sch.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dateSet.add(this.toLocalDateKey(d));
      }
    } else {
      // fallback: collect dates from assignments
      assignments.forEach((a: any) => {
        if (a && (a.date || a.Date)) dateSet.add(this.toLocalDateKey(a.date || a.Date));
      });
    }

    // Build employees list from assignments (ids only); we'll try to resolve names by fetching team employees
    const empMap: Record<string, any> = {};
    assignments.forEach((a: any) => {
      const employeeId = a.employeeId ?? a.employee?.id ?? a.EmployeeId ?? a.Employee?.Id;
      if (employeeId == null) return;
      if (!empMap[String(employeeId)]) {
        // try to find the employee name from preloaded teamEmployees
        const found = this.teamEmployees.find(te => String(te.id ?? te.Id ?? te.employeeId ?? te.EmployeeId) === String(employeeId));
        const name = found ? (found.name ?? found.Name ?? found.employeeName ?? found.EmployeeName) : String(employeeId);
        empMap[String(employeeId)] = { id: employeeId, name };
      }
    });

    // If there are no assignments but the API provided employees list, include them
    const schEmps = sch.employees || sch.Employees || [];
    if (Array.isArray(schEmps) && schEmps.length) {
      schEmps.forEach((e: any) => {
        const id = e.id ?? e.Id ?? e.employeeId ?? e.EmployeeId;
        const name = e.name ?? e.Name ?? e.employeeName ?? e.EmployeeName ?? String(id);
        if (id != null) empMap[String(id)] = { id, name };
      });
    }

    this.tableDates = Array.from(dateSet).sort();
    this.tableEmployees = Object.values(empMap);

    // build cells map
    this.tableCells = {};
    assignments.forEach((a: any) => {
      const employeeId = a.employeeId ?? a.employee?.id ?? a.EmployeeId ?? a.Employee?.Id;
      const shiftTypeId = a.shiftTypeId ?? a.shiftType?.id ?? a.ShiftTypeId ?? null;
      const dateStrRaw = (a.date ?? a.Date ?? '').toString();
      const dateKey = this.toLocalDateKey(dateStrRaw);
      const key = `${employeeId}__${dateKey}`;
      this.tableCells[key] = { ...a, employeeId, shiftTypeId, date: dateKey };
    });
    // Prefer names from preloaded teamEmployees (already applied above)
    this.tableEmployees = Object.values(empMap);

    // If any employee entries lack proper names, fetch employee list and map names
    const missing = this.tableEmployees.filter((e: any) => !e.name || String(e.name).match(/^\d+$/));
    if (missing.length > 0) {
      const ensureNames = (emps: any[]) => {
        const byId: Record<string, any> = {};
        (emps || []).forEach((ee: any) => {
          const id = ee.id ?? ee.Id ?? ee.employeeId ?? ee.EmployeeId;
          if (id != null) byId[String(id)] = ee;
        });
        let updated = false;
        this.tableEmployees.forEach((te: any) => {
          const found = byId[String(te.id)];
          if (found && (found.name || found.firstName || found.fullName)) {
            te.name = (found.name ?? `${found.firstName ?? ''} ${found.lastName ?? ''}`.trim()) || te.name;
            updated = true;
          }
        });
        // also update any existing tableCells employeeName
        Object.keys(this.tableCells).forEach(k => {
          const c = this.tableCells[k];
          const id = String(c.employeeId);
          if (byId[id]) {
            const f = byId[id];
            c.employeeName = (f.name ?? `${f.firstName ?? ''} ${f.lastName ?? ''}`.trim()) || c.employeeName;
          }
        });
        if (updated) this.tableEmployees = [...this.tableEmployees];
      };

      // If we have a selected team, use preloaded teamEmployees (already available) else load all employees
      if (this.teamEmployees && this.teamEmployees.length) {
        ensureNames(this.teamEmployees);
      } else {
        this.api.listEmployees().subscribe(emps => ensureNames(emps || []));
      }
    }
    // ensure shift types loaded
    if (!this.shiftTypes || !this.shiftTypes.length) {
      if (this.selectedTeamId) {
        this.api.getShiftTypes(this.selectedTeamId).subscribe(t => this.shiftTypes = t || []);
      }
    }
  }

  // Format the date header as '16 Oct 2025'
  formatDateHeader(dateIso: string) {
    if (!dateIso) return '';
    const d = new Date(dateIso);
    const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return d.toLocaleDateString(undefined, opts);
  }

  // Normalize a Date or ISO date string to local YYYY-MM-DD to avoid UTC offset shifts
  toLocalDateKey(dateInput: string | Date) {
    if (!dateInput) return '';
    const d = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput as Date);
    // Build local YYYY-MM-DD
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // Ensure each table column is at least as wide as its header text; allow expansion if content is larger
  adjustColumnWidths() {
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
  createEmptyCellAndSave(employeeId: string | number, date: string) {
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
    // call save flow
    this.saveCell(String(employeeId), date);
    // clear temp model
    delete this.emptyCellModel[key];
  }

  closeView() {
    this.viewingSchedule = null;
    this.tableEmployees = [];
    this.tableDates = [];
    this.tableCells = {};
  }

  // Save single cell change (assignment) — calls updateAssignment
  saveCell(employeeId: string, date: string) {
    const key = `${employeeId}__${date}`;
    const cell = this.tableCells[key];
    if (!cell) return;
    // Prevent saving past dates
    if (this.isPastDate(date)) return;
    const dto = { employeeId: Number(cell.employeeId), date: date, newShiftTypeId: cell.shiftTypeId ? Number(cell.shiftTypeId) : null };
    // call patchAssignment on the schedule
    this.api.patchAssignment(this.viewingSchedule.id, dto).subscribe({
      next: (res: any) => {
        // if server returned a created object, use its id; if returned Ok(existing) use it; if NoContent (delete) we'll remove from table
        if (!dto.newShiftTypeId) {
          // deletion: remove cell
          delete this.tableCells[`${employeeId}__${date}`];
        } else if (res && res.id) {
          // creation or update returned the assignment
          this.tableCells[`${employeeId}__${date}`] = { ...res };
        } else {
          // best-effort: update the local cell shiftTypeId
          this.tableCells[`${employeeId}__${date}`].shiftTypeId = dto.newShiftTypeId;
        }
        this.toasts.show('Assignment saved', 'success');
      },
      error: (err: any) => {
        console.error('Failed to save assignment', err);
        this.toasts.show('Failed to save assignment', 'error');
      }
    });
  }

  isPastDate(dateIso: string) {
    const d = new Date(dateIso);
    const today = new Date();
    return d.setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0);
  }
}
