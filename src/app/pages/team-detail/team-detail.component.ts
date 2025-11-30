import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Team } from '../../models/team';

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
  availableEmployees: any[] = [];

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      const idStr = pm.get('id');
      if (!idStr) { this.router.navigate(['/teams']); return; }
      this.teamId = parseInt(idStr, 10);
      this.load();
    });
  }

  load() {
    this.loading = true;
    this.api.getTeamById(this.teamId).subscribe({ next: (t) => {
        // ensure arrays are present (server may return null or $values-wrapped objects)
        const unwrap = (val: any) => {
          if (!val) return [];
          if (Array.isArray(val)) return val;
          if (val.$values && Array.isArray(val.$values)) return val.$values;
          return [];
        };
        if (t) {
          (t as any).employees = unwrap((t as any).employees);
          (t as any).shiftTypes = unwrap((t as any).shiftTypes);
          (t as any).rules = unwrap((t as any).rules);
        }
      this.team = t;
      this.loadAvailableEmployees();
    }, complete: () => (this.loading = false) });
  }

  loadAvailableEmployees() {
    // load all employees for the user and exclude those already in the team
    this.api.listEmployees().subscribe((list: any[]) => {
      const existing = new Set((this.team?.employees || []).map((e:any) => e.id));
      this.availableEmployees = list.filter(e => !existing.has(e.id));
    });
  }

  save() {
    if (!this.team) return;
    this.api.updateTeam(this.team.id, this.team).subscribe({ next: () => this.load() });
  }

  addEmployee() {
    if (!this.team) return;
    this.team.employees = this.team.employees || [];
    // placeholder row: id 0 indicates unsaved selection via dropdown
    this.team.employees.push({ id: 0, selectedEmployeeId: null });
  }

  attachEmployee(placeholder: any) {
    if (!this.team || !placeholder) return;
    const sel = placeholder.selectedEmployeeId;
    if (!sel) return;
    // find employee in available list
    const emp = this.availableEmployees.find(e => e.id === sel);
    if (!emp) return;
    // prevent duplicates
    const exists = (this.team.employees || []).some((e:any) => e.id === emp.id);
    if (exists) return;
    // replace placeholder with selected employee instance
    const arr = this.team.employees || [];
    const idx = arr.indexOf(placeholder);
    if (idx >= 0) arr.splice(idx, 1, emp);
    this.team.employees = arr;
    // refresh available employees
    this.loadAvailableEmployees();
  }

  removeEmployee(emp: any) {
    if (!this.team) return;
    this.team.employees = this.team.employees?.filter(e => e !== emp);
    this.loadAvailableEmployees();
  }

  addShift() {
    if (!this.team) return;
    this.team.shiftTypes = this.team.shiftTypes || [];
    this.team.shiftTypes.push({ id: 0, name: '', startTime: '08:00', endTime: '17:00', requiredPeople: 1 });
  }

  removeShift(s: any) {
    if (!this.team) return;
    this.team.shiftTypes = this.team.shiftTypes?.filter(x => x !== s);
  }
}
