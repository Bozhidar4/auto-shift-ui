import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { createEmptyShift, ShiftType } from '../../models/shift-type.interface';
import { Team } from '../../models/team';

@Component({
  selector: 'app-shifts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss']
})
export class ShiftsComponent implements OnInit {
  shifts: ShiftType[] = [];
  teams: Team[] = [];
  selectedTeamId: number = 0;
  newShift: ShiftType = createEmptyShift();
  loading = false;
  editingId: number | null = null;
  editModel: any = null;

  constructor(
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.loadTeams();
  }

  load(
    teamId?: number
  ): void {
    const id = teamId ?? this.selectedTeamId;

    if (!id) {
      this.shifts = [];
      return;
    }

    this.loading = true;
    this.apiService.getShiftTypes(id).subscribe({
      next: (s) => { this.shifts = s || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  loadTeams(): void {
    this.apiService
      .getTeams()
      .subscribe({
        next: (t) => {
          this.teams = t || [];

          if (this.teams.length) {
            this.selectedTeamId = this.teams[0].id;
            this.load(Number(this.selectedTeamId));
          }
        }
      });
  }

  create(): void {
    if (!this.selectedTeamId) {
      return;
    }

    const ensureSeconds = (t: string) => t && t.length === 5 ? `${t}:00` : t;
    const payload: ShiftType = {
      ...this.newShift,
      teamId: Number(this.selectedTeamId),
      startTime: ensureSeconds(this.newShift.startTime),
      endTime: ensureSeconds(this.newShift.endTime),
      requiredPeople: this.newShift.requiredPeople
    };
    this.apiService.createShiftType(payload).subscribe({
      next: (response) => {
        this.newShift = createEmptyShift();
        this.load(this.selectedTeamId);
      }
    });
  }

  editShift(
    shift: ShiftType
  ): void {
    const name = prompt('Edit shift name', shift.name);

    if (!name) {
      return;
    }

    const code = prompt('Edit shift code (single character)', shift.initialCode || '');

    if (!code) {
      return;
    }

    const trimmedCode = (code || '').toString().slice(0, 1);
    const updated = { ...shift, name: name || shift.name, initialCode: trimmedCode };

    this.apiService
      .updateShiftType(updated)
      .subscribe({
        next: () => {
          this.load(this.selectedTeamId)
          const idx = this.shifts.findIndex(x => x.id === shift.id);
          if (idx > -1) {
            this.shifts[idx] = updated;
          }
        }
      });
  }

  deleteShift(
    shift: ShiftType
  ): void {
    if (!confirm(`Delete shift type "${shift.name}"?`)) {
      return;
    }

    this.apiService
      .deleteShiftType(shift.id)
      .subscribe({
        next: () => {
          this.load(this.selectedTeamId);
          this.shifts = this.shifts.filter(x => x.id !== shift.id);
        }
      });
  }

  startEdit(
    shift: ShiftType
  ): void {
    this.editingId = shift.id;
    // clone model and map InitialCode if necessary
    this.editModel = { ...shift };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editModel = null;
  }

  canSaveEdit(): boolean {
    if (!this.editModel) {
      return false;
    }

    const code = (this.editModel.code || '').toString().trim();
    // allow empty code, but if present must be single alphanumeric char
    if (code && !/^[A-Za-z0-9]$/.test(code)) {
      return false;
    }
    // uniqueness: no other shift in this.shifts has same code (case-insensitive)
    const duplicates = this.shifts.filter(s => s.id !== this.editModel.id && (s.initialCode || '').toString().toLowerCase() === code.toLowerCase());
    if (code && duplicates.length) {
      return false;
    }
    // name must be present
    if (!this.editModel.name || !this.editModel.name.toString().trim()) {
      return false;
    }

    return true;
  }

  saveEdit(): void {
    if (!this.editModel || !this.canSaveEdit()) {
      return;
    }

    this.apiService
      .updateShiftType(this.editModel)
      .subscribe({
        next: () => {
          this.cancelEdit();
          this.load(this.selectedTeamId);
          const idx = this.shifts.findIndex(x => x.id === this.editModel.id);
          if (idx > -1) {
            this.shifts[idx] = this.editModel;
          }
        }
      });
  }
}
