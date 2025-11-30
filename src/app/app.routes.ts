import { Routes } from '@angular/router';
import { provideRoutes } from '@angular/router';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'dashboard' },
	{ path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
	{ path: 'login', loadComponent: () => import('./pages/auth/auth.component').then(m => m.AuthComponent) },
	{ path: 'teams', loadComponent: () => import('./pages/teams/teams.component').then(m => m.TeamsComponent) },
	{ path: 'teams/:id', loadComponent: () => import('./pages/team-detail/team-detail.component').then(m => m.TeamDetailComponent) },
	{ path: 'employees', loadComponent: () => import('./pages/employees/employees.component').then(m => m.EmployeesComponent) },
	{ path: 'shifts', loadComponent: () => import('./pages/shifts/shifts.component').then(m => m.ShiftsComponent) },
	{ path: 'rules', loadComponent: () => import('./pages/rules/rules.component').then(m => m.RulesComponent) },
	{ path: 'schedules', loadComponent: () => import('./pages/schedules/schedules.component').then(m => m.SchedulesComponent) }
];
