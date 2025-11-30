import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface EmployeeRow {
  id?: number;
  firstName: string;
  lastName: string;
  monthlyHoursTarget: number;
  isActive: boolean;
  teamId?: number | null;
  _editing?: boolean;
}

interface SimpleTeam {
  id: number | string;
  name: string;
}

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
  employees: EmployeeRow[] = [];
  teams: SimpleTeam[] = [];
  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
    this.api.getTeams().subscribe((t) => (this.teams = t.filter(team => team.name != null).map(team => ({ id: team.id, name: team.name! }))));
  }

  load() {
    this.api.listEmployees().subscribe((list: any[]) => {
      this.employees = list.map((e) => ({
        id: e.id,
        firstName: e.firstName,
        lastName: e.lastName,
        monthlyHoursTarget: e.monthlyHoursTarget || 160,
        isActive: e.isActive ?? true,
        teamId: e.teamId
      }));
    });
  }

  addNew() {
    this.employees.unshift({ firstName: '', lastName: '', monthlyHoursTarget: 160, isActive: true, teamId: null, _editing: true });
  }

  edit(row: EmployeeRow) {
    row._editing = true;
  }

  save(row: EmployeeRow) {
    if (row.id) {
      this.api.updateEmployee(row.id, row).subscribe(() => { row._editing = false; this.load(); });
    } else {
      this.api.createEmployee(row).subscribe(() => { this.load(); });
    }
  }

  remove(row: EmployeeRow) {
    if (!row.id) {
      this.employees = this.employees.filter((r) => r !== row);
      return;
    }
    this.api.deleteEmployee(row.id).subscribe(() => this.load());
  }
}
