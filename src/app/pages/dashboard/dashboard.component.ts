import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';


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

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCounts();
  }

  loadCounts() {
    this.api.getTeams().subscribe({ next: (t) => this.teamsCount = (t || []).length });
    this.api.listEmployees().subscribe({ next: (e) => this.employeesCount = (e || []).length });
    this.api.getShiftTypes().subscribe({ next: (s) => this.shiftTypesCount = (s || []).length });
  }
}
