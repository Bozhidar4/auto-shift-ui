import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { lastValueFrom } from 'rxjs';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  teamsCount = 0;
  employeesCount = 0;
  shiftTypesCount = 0;

  constructor(
    private api: ApiService
  ) { }

  ngOnInit(): void {
    this.loadCounts();
  }

  async loadCounts(): Promise<void> {
    try {
      const [teams, employees, shiftTypes] = await Promise.all([
        lastValueFrom(this.api.getTeams()),
        lastValueFrom(this.api.listEmployees()),
        lastValueFrom(this.api.getShiftTypes())
      ]);
      this.teamsCount = (teams || []).length;
      this.employeesCount = (employees || []).length;
      this.shiftTypesCount = (shiftTypes || []).length;
    } catch (err) {
      console.error('Failed to load counts', err);
      // fallback: attempt individual calls (best-effort)
      this.api.getTeams().subscribe({ next: (t) => this.teamsCount = (t || []).length });
      this.api.listEmployees().subscribe({ next: (e) => this.employeesCount = (e || []).length });
      this.api.getShiftTypes().subscribe({ next: (s) => this.shiftTypesCount = (s || []).length });
    }
  }
}
