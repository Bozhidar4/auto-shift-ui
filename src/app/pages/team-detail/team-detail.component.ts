import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Team } from '../../models/team';
import { createEmptyEmployee, Employee } from '../../models/employee.interface';
import { createEmptyShift, ShiftType } from '../../models/shift-type.interface';
import { TeamCreate } from '../../models/team-create..interface';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss']
})
export class TeamDetailComponent implements OnInit {
  teamId = 0;
  team: Team | null = null;
  loading = false;
  availableEmployees: Employee[] = [];

  constructor(
    private route: ActivatedRoute, 
    private apiService: ApiService, 
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      const idString = pm.get('id');

      if (!idString) { 
        this.router.navigate(['/teams']); return; 
      }

      this.teamId = parseInt(idString, 10);
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.apiService.getTeamById(this.teamId).subscribe({
      next: (team: Team | null) => {
        // ensure arrays are present (server may return null or $values-wrapped objects)
        const unwrap = (val: any) => {
          if (!val) {
            return [];
          }

          if (Array.isArray(val)) {
            return val;
          }

          if (val.$values && Array.isArray(val.$values)) {
            return val.$values;
          }

          return [];
        };
        if (team) {
          team.employees = unwrap((team).employees);
          team.shiftTypes = unwrap((team).shiftTypes);
          team.rules = unwrap((team).rules);
        }

        this.team = team;
        this.loadAvailableEmployees();
      }, complete: () => (this.loading = false)
    });
  }

  loadAvailableEmployees(): void {
    // load all employees for the user and exclude those already in the team
    this.apiService.listEmployees().subscribe((list: Employee[]) => {
      const existing = new Set((this.team?.employees || []).map((e:Employee) => e.id));
      this.availableEmployees = list.filter(e => !existing.has(e.id));
    });
  }

  save(): void {
    if (!this.team || !this.team.name || this.team.name.trim().length === 0) {
      return;
    }

    const model: TeamCreate = { name: this.team.name };

    this.apiService
      .updateTeam(this.team.id, model)
      .subscribe({ next: () => this.load() });
  }

  addEmployee(): void {
    if (!this.team) {
      return;
    }

    this.team.employees = this.team.employees || [];
    // placeholder row: id 0 indicates unsaved selection via dropdown
    this.team.employees.push(createEmptyEmployee());
  }

  attachEmployee(
    placeholder: Employee
  ): void {
    if (!this.team || !placeholder) {
      return;
    }

    const selectedEmployeeId = placeholder.id;
    if (!selectedEmployeeId) {
      return;
    }

    // find employee in available list
    const employee = this.availableEmployees.find(e => e.id === selectedEmployeeId);
    if (!employee) {
      return;
    }

    // prevent duplicates
    const employeeExists = (this.team.employees || []).some((e:any) => e.id === employee.id);
    if (employeeExists) {
      return;
    }

    // replace placeholder with selected employee instance
    const employeeArray = this.team.employees || [];
    const index = employeeArray.indexOf(placeholder);
    if (index >= 0) {
      employeeArray.splice(index, 1, employee);
    }

    this.team.employees = employeeArray;
    // refresh available employees
    this.loadAvailableEmployees();
  }

  removeEmployee(
    employee: Employee
  ): void {
    if (!this.team) {
      return;
    }

    this.team.employees = this.team.employees?.filter(e => e !== employee);
    this.loadAvailableEmployees();
  }

  addShift(): void {
    if (!this.team) {
      return;
    }

    this.team.shiftTypes = this.team.shiftTypes || [];
    this.team.shiftTypes.push(createEmptyShift());
  }

  removeShift(
    shift: ShiftType
  ): void {
    if (!this.team) {
      return;
    }

    this.team.shiftTypes = this.team.shiftTypes?.filter(x => x !== shift);
  }
}
