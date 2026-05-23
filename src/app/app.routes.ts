import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
	// Top-level marketing/auth routes (no app shell)
	{ path: '', pathMatch: 'full', loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent) },
	{ path: 'login', loadComponent: () => import('./pages/auth/auth.component').then(m => m.AuthComponent) },
	{ path: 'terms', loadComponent: () => import('./pages/legal/terms.component').then(m => m.TermsComponent) },
	{ path: 'privacy', loadComponent: () => import('./pages/legal/privacy.component').then(m => m.PrivacyComponent) },
	{ path: 'cookies', loadComponent: () => import('./pages/legal/cookie-policy.component').then(m => m.CookiePolicyComponent) },

	// App shell routes — LayoutComponent contains the header/sidebar and a router-outlet for children
	{
		path: '',
		loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
		canActivateChild: [AuthGuard],
		children: [
			{ path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
			{ path: 'teams', loadComponent: () => import('./pages/teams/teams.component').then(m => m.TeamsComponent) },
			{ path: 'teams/:id', loadComponent: () => import('./pages/team-detail/team-detail.component').then(m => m.TeamDetailComponent) },
			{ path: 'employees', loadComponent: () => import('./pages/employees/employees.component').then(m => m.EmployeesComponent) },
			{ path: 'shifts', loadComponent: () => import('./pages/shifts/shifts.component').then(m => m.ShiftsComponent) },
			{ path: 'rules', loadComponent: () => import('./pages/rules/rules.component').then(m => m.RulesComponent) },
			{ path: 'schedules', loadComponent: () => import('./pages/schedules/schedules.component').then(m => m.SchedulesComponent) },
			{ path: 'leaves', loadComponent: () => import('./pages/leaves/leaves.component').then(m => m.LeavesComponent) },
			{ path: 'feedback', loadComponent: () => import('./pages/feedback/feedback.component').then(m => m.FeedbackComponent) },
			{ path: 'billing', loadComponent: () => import('./pages/billing/billing.component').then(m => m.BillingComponent) }
		]
	},

	// fallback
	{ path: '**', redirectTo: '' }
];
