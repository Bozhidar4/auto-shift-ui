import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { Team } from '../../models/team';
import { createEmptyEmployee, Employee } from '../../models/employee.interface';
import { ShiftType } from '../../models/shift-type.interface';
import { TeamCreate } from '../../models/team-create..interface';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
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
    private router: Router,
    private toastService: ToastService
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
        const unwrap = <T>(val: any) => {
          if (!val) {
            return [];
          }

          if (Array.isArray(val)) {
            return val as T[];
          }

          if (val.$values && Array.isArray(val.$values)) {
            return val.$values as T[];
          }

          return [];
        };
        if (team) {
          team.employees = unwrap<Employee>((team).employees);
          team.shiftTypes = unwrap<ShiftType>((team).shiftTypes);
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

    const model: TeamCreate = {
      name: this.team.name,
      employees: this.team.employees?.filter(e => e.id !== 0), // exclude placeholders
      shiftTypes: this.team.shiftTypes
    };

    this.apiService
      .updateTeam(this.team.id, model)
      .subscribe({
        next: () => {
          this.load();
          this.toastService.show('Team saved successfully.', 'success');
        },
        error: (error) => {
          this.toastService.show('Failed to save team.', 'error');
        }
      });
  }

  addEmployee(): void {
    if (!this.team) {
      return;
    }

    this.team.employees = this.team.employees || [];
    // placeholder row: id 0 indicates unsaved selection via dropdown
    this.team.employees.push(createEmptyEmployee());
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

  onAvailableSelected(
    placeholder: Employee,
    selectedId: number
  ): void {
    if (!this.team || !placeholder || !selectedId) {
      return;
    }

    const foundEmployee = this.availableEmployees.find(e => e.id === selectedId);
    if (!foundEmployee) {
      return;
    }

    const employeeArray = this.team.employees || [];
    const index = employeeArray.indexOf(placeholder);

    if (index >= 0) {
      foundEmployee.teamId = this.team.id;
      employeeArray.splice(index, 1, { ...foundEmployee });
      this.team.employees = employeeArray;
    }

    this.loadAvailableEmployees();
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
