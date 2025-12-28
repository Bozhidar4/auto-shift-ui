import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-shifts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss']
})
export class ShiftsComponent implements OnInit {
  shifts: any[] = [];
  teams: any[] = [];
  selectedTeamId: number = 0;
  // simple form model for creating a shift type
  newShift: any = { name: '', code: '', startTime: '', endTime: '', requiredPeople: 0 };
  loading = false;
  editingId: number | null = null;
  editModel: any = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadTeams();
  }

  load(teamId?: number) {
    const id = teamId ?? this.selectedTeamId;
    if (!id) {
      this.shifts = [];
      return;
    }
    this.loading = true;
    this.api.getShiftTypes(id).subscribe({
      next: (s) => { this.shifts = s || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  loadTeams() {
    this.api.getTeams().subscribe({ next: (t) => { this.teams = t || []; if (this.teams.length) { this.selectedTeamId = this.teams[0].id; this.load(Number(this.selectedTeamId)); } } });
  }

  create() {
    if (!this.selectedTeamId) return;
    const ensureSeconds = (t: string) => t && t.length === 5 ? `${t}:00` : t;
    const payload = {
      ...this.newShift,
      teamId: Number(this.selectedTeamId),
      startTime: ensureSeconds(this.newShift.startTime),
      endTime: ensureSeconds(this.newShift.endTime),
      requiredPeople: this.newShift.requiredPeople
    };
    this.api.createShiftType(payload).subscribe({
      next: (res: any) => {
        this.newShift = { name: '', code: '', startTime: '', endTime: '' };
        this.load(this.selectedTeamId);
      }
    });
  }

  editShift(s: any) {
    const name = prompt('Edit shift name', s.name);
    if (name === null) return;
    const code = prompt('Edit shift code (single character)', s.code || '');
    if (code === null) return;
    const trimmedCode = (code || '').toString().slice(0, 1);
    const updated = { ...s, name: name || s.name, code: trimmedCode };
    // if ApiService has updateShiftType, use it, otherwise update locally
    if ((this.api as any).updateShiftType) {
      (this.api as any).updateShiftType(updated).subscribe({ next: () => this.load(this.selectedTeamId) });
    } else {
      const idx = this.shifts.findIndex(x => x.id === s.id);
      if (idx > -1) { this.shifts[idx] = updated; }
    }
  }

  deleteShift(s: any) {
    if (!confirm(`Delete shift type "${s.name}"?`)) return;
    if ((this.api as any).deleteShiftType) {
      (this.api as any).deleteShiftType(s.id).subscribe({ next: () => this.load(this.selectedTeamId) });
    } else {
      this.shifts = this.shifts.filter(x => x.id !== s.id);
    }
  }

  startEdit(s: any) {
    this.editingId = s.id;
    // clone model and map InitialCode/code if necessary
    this.editModel = { ...s };
  }

  cancelEdit() {
    this.editingId = null;
    this.editModel = null;
  }

  canSaveEdit(): boolean {
    if (!this.editModel) return false;
    const code = (this.editModel.code || '').toString().trim();
    // allow empty code, but if present must be single alphanumeric char
    if (code && !/^[A-Za-z0-9]$/.test(code)) return false;
    // uniqueness: no other shift in this.shifts has same code (case-insensitive)
    const duplicates = this.shifts.filter(s => s.id !== this.editModel.id && (s.code || '').toString().toLowerCase() === code.toLowerCase());
    if (code && duplicates.length) return false;
    // name must be present
    if (!this.editModel.name || !this.editModel.name.toString().trim()) return false;
    return true;
  }

  saveEdit() {
    if (!this.editModel) return;
    if (!this.canSaveEdit()) return;

    const payload = { ...this.editModel };
    if ((this.api as any).updateShiftType) {
      (this.api as any).updateShiftType(payload).subscribe({ next: () => { this.cancelEdit(); this.load(this.selectedTeamId); } });
    } else {
      const idx = this.shifts.findIndex(x => x.id === payload.id);
      if (idx > -1) { this.shifts[idx] = payload; }
      this.cancelEdit();
    }
  }
}
