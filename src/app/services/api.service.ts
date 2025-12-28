import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Team } from '../models/team';
import { Employee } from '../models/employee';
import { ShiftType } from '../models/shift';
import { ShiftRule } from '../models/rule';
import { GeneratedSchedule } from '../models/schedule';

const BASE_URL = 'https://localhost:7291/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getTeams(): Observable<Team[]> {
    return this.http.get<any>(`${BASE_URL}/teams`).pipe(
      map((res: any) => {
        if (!res) return [] as Team[];
        if (res.$values && Array.isArray(res.$values)) return res.$values as Team[];
        return res as Team[];
      })
    );
  }

  createTeam(model: any) {
    return this.http.post(`${BASE_URL}/teams`, model).pipe(
      map((res: any) => { if (res && (res.error || res.errors || res.success === false)) throw res; return res; })
    );
  }

  updateTeam(id: number | string, model: any) {
    return this.http.put(`${BASE_URL}/teams/${id}`, model).pipe(
      map((res: any) => { if (res && (res.error || res.errors || res.success === false)) throw res; return res; })
    );
  }

  deleteTeam(id: number | string) {
    return this.http.delete(`${BASE_URL}/teams/${id}`).pipe(
      map((res: any) => { if (res && (res.error || res.errors || res.success === false)) throw res; return res; })
    );
  }

  getTeamById(id: number) {
    return this.http.get<any>(`${BASE_URL}/teams/${id}`).pipe(
      map((res: any) => {
        if (!res) return null as any;
        if (res.$values && Array.isArray(res.$values)) return res.$values[0] as Team;
        return res as Team;
      })
    );
  }

  getEmployees(teamId: string): Observable<Employee[]> {
    return this.http.get<any>(`${BASE_URL}/teams/${encodeURIComponent(teamId)}/employees`).pipe(
      map((res: any) => {
        if (!res) return [] as Employee[];
        if (res.$values && Array.isArray(res.$values)) return res.$values as Employee[];
        return res as Employee[];
      })
    );
  }

  // Employees endpoints (server exposes api/employees with optional teamId query)
  listEmployees(teamId?: number) {
    const url = `${BASE_URL}/employees${teamId ? `?teamId=${teamId}` : ''}`;
    return this.http.get<any>(url).pipe(
      map((res: any) => {
        if (!res) return [] as any[];
        if (res.$values && Array.isArray(res.$values)) return res.$values as any[];
        return res as any[];
      })
    );
  }

  createEmployee(model: any) {
    return this.http.post(`${BASE_URL}/employees`, model).pipe(
      map((res: any) => {
        // If backend returns { error: '...' } or similar, throw to be handled by ErrorInterceptor
        if (res && (res.error || res.errors || (res.success === false))) throw res;
        return res;
      })
    );
  }

  updateEmployee(id: number, model: any) {
    return this.http.put(`${BASE_URL}/employees/${id}`, model).pipe(
      map((res: any) => {
        if (res && (res.error || res.errors || (res.success === false))) throw res;
        return res;
      })
    );
  }

  deleteEmployee(id: number) {
    return this.http.delete(`${BASE_URL}/employees/${id}`).pipe(
      map((res: any) => {
        if (res && (res.error || res.errors || (res.success === false))) throw res;
        return res;
      })
    );
  }

  // Fetch shifts. Backend controller is `ShiftsController` at /api/shifts.
  getShiftTypes(teamId?: number | string): Observable<ShiftType[]> {
    const options = teamId ? { params: new HttpParams().set('teamId', String(teamId)) } : {};
    return this.http.get<any>(`${BASE_URL}/shifts`, options).pipe(
      map((res: any) => {
        if (!res) return [] as ShiftType[];
        if (res.$values && Array.isArray(res.$values)) return res.$values as ShiftType[];
        if (Array.isArray(res)) return res as ShiftType[];
        return [] as ShiftType[];
      })
    );
  }

  // Get shift by id: GET /shifts/{id}
  getShiftTypeById(id: number) {
    return this.http.get<ShiftType>(`${BASE_URL}/shifts/${id}`);
  }

  // Create shift: POST /shifts
  createShiftType(model: any) {
    // backend expects InitialCode property name; map from `code` if provided
    const payload = { ...model } as any;
    if (payload.code !== undefined) { payload.initialCode = payload.code; delete payload.code; }
    return this.http.post(`${BASE_URL}/shifts`, payload).pipe(
      map((res: any) => { if (res && (res.error || res.errors || (res.success === false))) throw res; return res; })
    );
  }

  // Update shift: PUT /shifts/{id}
  updateShiftType(model: any) {
    const id = model.id;
    const payload = { ...model } as any;
    if (payload.code !== undefined) { payload.initialCode = payload.code; delete payload.code; }
    return this.http.put(`${BASE_URL}/shifts/${id}`, payload).pipe(
      map((res: any) => { if (res && (res.error || res.errors || (res.success === false))) throw res; return res; })
    );
  }

  // Delete shift: DELETE /shifts/{id}
  deleteShiftType(id: number) {
    return this.http.delete(`${BASE_URL}/shifts/${id}`).pipe(
      map((res: any) => { if (res && (res.error || res.errors || (res.success === false))) throw res; return res; })
    );
  }

  // Employee leaves endpoints
  listEmployeeLeaves(employeeId?: number) {
    const url = `${BASE_URL}/employeeLeaves${employeeId ? `?employeeId=${employeeId}` : ''}`;
    return this.http.get<any>(url).pipe(
      map((res:any)=>{ if (!res) return []; if (res.$values && Array.isArray(res.$values)) return res.$values; return res; })
    );
  }

  createEmployeeLeave(model: any) {
    return this.http.post(`${BASE_URL}/employeeLeaves`, model).pipe(
      map((res:any)=> { if (res && (res.error || res.errors || (res.success === false))) throw res; return res; })
    );
  }

  updateEmployeeLeave(id: number, model: any) {
    return this.http.put(`${BASE_URL}/employeeLeaves/${id}`, model).pipe(
      map((res:any)=> { if (res && (res.error || res.errors || (res.success === false))) throw res; return res; })
    );
  }

  deleteEmployeeLeave(id: number) {
    return this.http.delete(`${BASE_URL}/employeeLeaves/${id}`).pipe(
      map((res:any)=> { if (res && (res.error || res.errors || (res.success === false))) throw res; return res; })
    );
  }

  // Leave types
  createLeaveType(model: any) {
    return this.http.post(`${BASE_URL}/leaveTypes`, model).pipe(
      map((res:any)=> { if (res && (res.error || res.errors || (res.success === false))) throw res; return res; })
    );
  }

  getLeaveTypeById(id: number) {
    return this.http.get<any>(`${BASE_URL}/leaveTypes/${id}`);
  }

  getLeaveTypes() {
    return this.http.get<any>(`${BASE_URL}/leaveTypes`).pipe(
      map((res:any) => { if (!res) return []; if (res.$values && Array.isArray(res.$values)) return res.$values; return res; })
    );
  }

  updateLeaveType(id: number, model: any) {
    return this.http.put(`${BASE_URL}/leaveTypes/${id}`, model).pipe(
      map((res:any)=> { if (res && (res.error || res.errors || (res.success === false))) throw res; return res; })
    );
  }

  deleteLeaveType(id: number) {
    return this.http.delete(`${BASE_URL}/leaveTypes/${id}`).pipe(
      map((res:any)=> { if (res && (res.error || res.errors || (res.success === false))) throw res; return res; })
    );
  }

  getRules(teamId: string): Observable<ShiftRule[]> {
    return this.http.get<ShiftRule[]>(`${BASE_URL}/teams/${encodeURIComponent(teamId)}/rules`);
  }

  // Fetch all system rules (not team-specific)
  getAllRules(): Observable<ShiftRule[]> {
    return this.http.get<any>(`${BASE_URL}/rules`).pipe(
      map((res: any) => {
        if (!res) return [] as ShiftRule[];
        if (res.$values && Array.isArray(res.$values)) return res.$values as ShiftRule[];
        return res as ShiftRule[];
      })
    );
  }

  // Team rule values (team-scoped values for rules that require input)
  getTeamRuleValues(teamId?: number) {
    const url = `${BASE_URL}/teamRuleValues${teamId ? `?teamId=${teamId}` : ''}`;
    return this.http.get<any>(url).pipe(
      map((res: any) => {
        if (!res) return [] as any[];
        if (res.$values && Array.isArray(res.$values)) return res.$values as any[];
        return res as any[];
      })
    );
  }

  createTeamRuleValue(model: any) {
    return this.http.post(`${BASE_URL}/teamRuleValues`, model).pipe(
      map((res: any) => { if (res && (res.error || res.errors || (res.success === false))) throw res; return res; })
    );
  }

  updateTeamRuleValue(id: number, model: any) {
    return this.http.put(`${BASE_URL}/teamRuleValues/${id}`, model).pipe(
      map((res: any) => { if (res && (res.error || res.errors || (res.success === false))) throw res; return res; })
    );
  }

  generateSchedule(teamId: string, startDate: string, endDate: string): Observable<GeneratedSchedule> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.post<GeneratedSchedule>(`${BASE_URL}/teams/${encodeURIComponent(teamId)}/generate`, null, { params });
  }

  // New: generate schedule via schedules controller
  generateScheduleRequest(model: any) {
    // Accept either camelCase or PascalCase keys and normalize to PascalCase expected by backend
    const payload: any = {
      TeamId: model.TeamId ?? model.teamId ?? model.Teamid ?? model.teamid,
      StartDate: model.StartDate ?? model.startDate ?? model.start_date,
      EndDate: model.EndDate ?? model.endDate ?? model.end_date
    };
    return this.http.post(`${BASE_URL}/schedules/generate`, payload).pipe(
      map((res: any) => { if (res && (res.error || res.errors || (res.success === false))) throw res; return res; })
    );
  }

  // List schedules (optionally filtered by teamId)
  getSchedules(teamId?: number) {
    const url = `${BASE_URL}/schedules${teamId ? `?teamId=${teamId}` : ''}`;
    return this.http.get<any>(url).pipe(
      map((res: any) => {
        if (!res) return [] as any[];
        if (res.$values && Array.isArray(res.$values)) return res.$values as any[];
        return res as any[];
      })
    );
  }

  // Get single schedule by id
  getSchedule(id: number | string) {
    return this.http.get<any>(`${BASE_URL}/schedules/${id}`).pipe(
      map((res: any) => {
        if (!res) return null as any;
        return res;
      })
    );
  }

  // Update schedule metadata (e.g., endDate)
  updateSchedule(id: string | number, model: any) {
    return this.http.put(`${BASE_URL}/schedules/${id}`, model).pipe(
      map((res: any) => { if (res && (res.error || res.errors || (res.success === false))) throw res; return res; })
    );
  }

  // Delete schedule
  deleteSchedule(id: string | number) {
    return this.http.delete(`${BASE_URL}/schedules/${id}`).pipe(
      map((res: any) => { if (res && (res.error || res.errors || (res.success === false))) throw res; return res; })
    );
  }

  // Update a single assignment (e.g., change shiftTypeId)
  // Patch an assignment for a schedule: PATCH /schedules/{id}/assignment
  // Body: { employeeId, date, newShiftTypeId }
  patchAssignment(scheduleId: string | number, dto: any) {
    return this.http.patch(`${BASE_URL}/schedules/${scheduleId}/assignment`, dto).pipe(
      map((res: any) => { if (res && (res.error || res.errors || (res.success === false))) throw res; return res; })
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${BASE_URL}/auth/login`, { email, password }).pipe(
      map((res:any) => { if (res && (res.error || res.errors || res.success === false)) throw res; return res; })
    );
  }

  // Diagnostic: try multiple payload shapes for login; suppress global toasts via header
  loginFlexible(email: string, password: string) {
    const tries = [
      { email, password },
      { username: email, password },
      { Email: email, Password: password }
    ];

    // Try each payload sequentially using fetch-style chaining
    const attempt = (idx: number): Observable<any> => {
      if (idx >= tries.length) return this.http.post(`${BASE_URL}/auth/login`, tries[0]);
      const payload = tries[idx];
      const headers = { 'x-skip-toast': '1' } as any;
      return this.http.post(`${BASE_URL}/auth/login`, payload, { headers }).pipe(
        map((res:any) => { return res; })
      );
    };

    // Simple implementation: try the first; callers can use server logs to iterate if needed.
    return attempt(0);
  }

  register(email: string, password: string, displayName?: string): Observable<any> {
    // Backend expects { Email, Password } (case-insensitive). Include displayName if provided.
    const body: any = { email, password };
    if (displayName) body.displayName = displayName;
    return this.http.post(`${BASE_URL}/auth/register`, body).pipe(
      map((res:any) => { if (res && (res.error || res.errors || res.success === false)) throw res; return res; })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${BASE_URL}/auth/logout`, {});
  }

  // Add other CRUD methods as needed (create/update/delete teams, employees, shifts, rules)
}
