import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Team } from '../../models/team';

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
  constructor(private api: ApiService) {}
  ngOnInit() {
    this.loading = true;
    this.api.getTeams().subscribe({ next: (t) => (this.teams = t), complete: () => (this.loading = false) });
  }

  load() {
    this.loading = true;
    this.api.getTeams().subscribe({ next: (t) => (this.teams = t), complete: () => (this.loading = false) });
  }

  addNew() {
    this.teams.unshift({ id: 0, name: '', _editing: true });
  }

  edit(t: Team) {
    t._editing = true;
  }

  save(t: Team) {
    const isNew = t.id === 0;
    const model: any = { name: t.name };
    if (isNew) {
      this.api.createTeam(model).subscribe({ next: () => this.load() });
    } else {
      this.api.updateTeam(t.id, model).subscribe({ next: () => this.load() });
    }
  }

  remove(t: Team) {
    if (t.id === 0) {
      this.teams = this.teams.filter(x => x !== t);
      return;
    }
    this.api.deleteTeam(t.id).subscribe({ next: () => this.load() });
  }

  cancelEdit(t: Team) {
    if (t.id === 0) {
      this.teams = this.teams.filter(x => x !== t);
      return;
    }
    t._editing = false;
  }
}
