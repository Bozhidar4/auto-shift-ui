import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { Team } from '../../models/team';
import { TeamCreate } from '../../models/team-create..interface';
import { ToastService } from '../../services/toast.service';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { ConfirmState, createEmptyConfirmState } from '../../models/confirm-state.interface';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmComponent, MatIconModule, TranslateModule],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss']
})
export class TeamsComponent implements OnInit {
  teams: Team[] = [];
  loading = false;
  originalTeam: Team | null = null;
  confirmState: ConfirmState = createEmptyConfirmState();

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.loading = true;

    this.apiService
      .getTeams()
      .subscribe({
        next: (t) => (this.teams = t),
        error: () => {
          this.toastService.show(this.translate.instant('TEAMS.ERROR_LOAD'), 'error');
        },
        complete: () => (this.loading = false)
      });
  }

  load(): void {
    this.loading = true;

    this.apiService
      .getTeams()
      .subscribe({
        next: (t) => (this.teams = t),
        error: () => {
          this.toastService.show(this.translate.instant('TEAMS.ERROR_LOAD'), 'error');
        },
        complete: () => (this.loading = false)
      });
  }

  addNew(): void {
    this.teams.unshift({ id: 0, name: '', _editing: true });
  }

  edit(
    team: Team
  ): void {
    team._editing = true;
    this.originalTeam = { ...team };
  }

  save(
    team: Team
  ): void {
    if (!team
      || !team.name
      || team.name.trim().length === 0) {
      this.toastService.show(this.translate.instant('TEAMS.VALIDATION_REQUIRED'), 'error');
      return;
    }

    const isNew = team.id === 0;
    const model: TeamCreate = { name: team.name };
    if (isNew) {
      this.apiService.createTeam(model).subscribe({
        next: () => {
          this.load();
          this.toastService.show(this.translate.instant('TEAMS.SUCCESS_CREATE'), 'success');
        },
        error: () => {
          // remove placeholder team from the list when creation fails
          this.teams = this.teams.filter(x => x !== team);
          this.toastService.show(this.translate.instant('TEAMS.ERROR_CREATE'), 'error');
        }
      });
    } else {
      this.apiService.updateTeam(team.id, model).subscribe({
        next: () => {
          this.load();
          this.toastService.show(this.translate.instant('TEAMS.SUCCESS_UPDATE'), 'success');
        },
        error: () => this.toastService.show(this.translate.instant('TEAMS.ERROR_UPDATE'), 'error')
      });
    }

    this.originalTeam = null;
    team._editing = false;
  }

  remove(
    team: Team
  ): void {
    if (team.id === 0) {
      this.teams = this.teams.filter(x => x !== team);
      return;
    }
    this.apiService.deleteTeam(team.id).subscribe({
      next: () => this.load(),
      error: () => this.toastService.show(this.translate.instant('TEAMS.ERROR_DELETE'), 'error')
    });
  }

  confirmRemove(
    team: Team
  ): void {
    this.confirmState = {
      visible: true,
      title: this.translate.instant('TEAMS.DELETE'),
      message: `${this.translate.instant('TEAMS.CONFIRM_DELETE')} ${team.name || team.id}?`,
      target: team
    };
  }

  onConfirmedRemove(): void {
    const team = this.confirmState.target as Team | undefined;
    this.confirmState.visible = false;
    if (!team) {
      return;
    }
    if (team.id === 0) {
      this.teams = this.teams.filter(x => x !== team);
      return;
    }

    this.apiService
      .deleteTeam(team.id)
      .subscribe({
        next: () => {
          this.load();
          this.toastService.show(this.translate.instant('TEAMS.SUCCESS_DELETE'), 'success');
        },
        error: () => this.toastService.show(this.translate.instant('TEAMS.ERROR_DELETE'), 'error')
      });
  }

  onCancelledRemove(): void {
    this.confirmState.visible = false;
  }

  cancelEdit(
    team: Team
  ): void {
    // If this is a newly added team (not yet saved), remove it from the list
    if (team.id === 0) {
      this.teams = this.teams.filter(x => x !== team);
      this.originalTeam = null;
      return;
    }

    // Restore original values into the array element so bindings update immediately
    if (this.originalTeam) {
      const idx = this.teams.findIndex(t => t === team || t.id === team.id);
      if (idx >= 0) {
        Object.assign(this.teams[idx], this.originalTeam);
      }
    }

    this.originalTeam = null;
    // Ensure the editing flag is cleared on the actual array element
    const arrEl = this.teams.find(t => t === team || t.id === team.id);

    if (arrEl) {
      arrEl._editing = false;
    }
  }
}
