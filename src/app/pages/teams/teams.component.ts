import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Team } from '../../models/team';
import { TeamCreate } from '../../models/team-create..interface';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss']
})
export class TeamsComponent implements OnInit {
  teams: Team[] = [];
  loading = false;

  constructor(
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.loading = true;

    this.apiService
      .getTeams()
      .subscribe({ next: (t) => (this.teams = t), complete: () => (this.loading = false) });
  }

  load(): void {
    this.loading = true;

    this.apiService
      .getTeams()
      .subscribe({ next: (t) => (this.teams = t), complete: () => (this.loading = false) });
  }

  addNew(): void {
    this.teams.unshift({ id: 0, name: '', _editing: true });
  }

  edit(
    team: Team
  ): void {
    team._editing = true;
  }

  save(
    team: Team
  ): void {
    if (!team
      || !team.name
      || team.name.trim().length === 0) {
      return;
    }

    const isNew = team.id === 0;
    const model: TeamCreate = { name: team.name };
    if (isNew) {
      this.apiService.createTeam(model).subscribe({ next: () => this.load() });
    } else {
      this.apiService.updateTeam(team.id, model).subscribe({ next: () => this.load() });
    }
  }

  remove(
    team: Team
  ): void {
    if (team.id === 0) {
      this.teams = this.teams.filter(x => x !== team);
      return;
    }

    this.apiService.deleteTeam(team.id).subscribe({ next: () => this.load() });
  }

  cancelEdit(
    team: Team
  ): void {
    if (team.id === 0) {
      this.teams = this.teams.filter(x => x !== team);
      return;
    }

    team._editing = false;
  }
}
