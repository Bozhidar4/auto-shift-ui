import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Team } from '../models/team';
import { Employee } from '../models/employee';
import { ShiftType } from '../models/shift';
import { ShiftRule, TeamRuleValue } from '../models/rule';
import { GeneratedSchedule } from '../models/schedule';
import { EmployeeLeave } from '../models/employee-leave.interface';
import { LeaveType } from '../models/leave-type.interface';
import { ScheduleAssignmentUpdateDto } from '../models/schedule-assignment-update.interface';

const BASE_URL = 'https://localhost:7291/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(
    private http: HttpClient
  ) { }

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${BASE_URL}/teams`).pipe(
      map((response: any) => {
        if (!response) {
          return [];
        }
        if (response.$values && Array.isArray(response.$values)) {
          return response.$values;
        }

        return response;
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

  listEmployees(
    teamId?: number
  ): Observable<Employee[]> {
    const url = `${BASE_URL}/employees${teamId ? `?teamId=${teamId}` : ''}`;
    return this.http.get<Employee[]>(url).pipe(
      map((res: any) => {
        if (!res) {
          return [];
        }

        if (res.$values && Array.isArray(res.$values)) {
          return res.$values;
        }

        return res;
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

  getShiftTypes(
    teamId?: number | string
  ): Observable<ShiftType[]> {
    const options = teamId ? { params: new HttpParams().set('teamId', String(teamId)) } : {};
    return this.http.get<ShiftType[]>(`${BASE_URL}/shifts`, options).pipe(
      map((result: any) => {
        if (!result) {
          return [];
        }
        if (result.$values && Array.isArray(result.$values)) {
          return result.$values;
        }
        if (Array.isArray(result)) {
          return result;
        }

        return [];
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

  updateShiftType(
    model: ShiftType
  ): Observable<ShiftType> {
    const id = model.id;
    const payload = { ...model } as ShiftType;
    if (payload.initialCode !== undefined) {
      payload.initialCode = payload.initialCode;
      delete payload.initialCode;
    }

    return this.http.put(`${BASE_URL}/shifts/${id}`, payload).pipe(
      map((res: any) => {
        if (res && (res.error || res.errors || (!res.success))) {
          throw res;
        }

        return res;
      })
    );
  }

  deleteShiftType(
    id: number
  ): Observable<void> {
    return this.http.delete(`${BASE_URL}/shifts/${id}`).pipe(
      map((res: any) => {
        if (res && (res.error || res.errors || (!res.success))) {
          throw res;
        }

        return;
      })
    );
  }

  // Employee leaves endpoints
  listEmployeeLeaves(
    employeeId: number
  ): Observable<EmployeeLeave[]> {
    const url = `${BASE_URL}/employeeLeaves${employeeId ? `?employeeId=${employeeId}` : ''}`;
    return this.http.get<EmployeeLeave[]>(url).pipe(
      map((res: any) => {
        if (!res) {
          return [];
        }
        if (res.$values && Array.isArray(res.$values)) {
          return res.$values;
        }

        return res;
      })
    );
  }

  createEmployeeLeave(
    model: EmployeeLeave
  ): Observable<any> {
    return this.http.post(`${BASE_URL}/employeeLeaves`, model).pipe(
      map((result: any) => {
        if (result && (result.error || result.errors || (!result.success))) {
          throw result;
        }

        return result;
      })
    );
  }

  updateEmployeeLeave(
    id: number,
    model: EmployeeLeave
  ): Observable<EmployeeLeave> {
    return this.http.put(`${BASE_URL}/employeeLeaves/${id}`, model).pipe(
      map((result: any) => {
        if (result && (result.error || result.errors || (result.success === false))) {
          throw result;
        }

        return result;
      })
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

  getLeaveTypes(): Observable<LeaveType[]> {
    return this.http.get<any>(`${BASE_URL}/leaveTypes`).pipe(
      map((res: any) => {
        if (!res) {
          return [];
        }
        if (res.$values && Array.isArray(res.$values)) {
          return res.$values;
        }
        return res;
      })
    );
  }

  updateLeaveType(
    model: LeaveType
  ): Observable<LeaveType> {
    return this.http.put(`${BASE_URL}/leaveTypes/${model.id}`, model).pipe(
      map((res: any) => {
        if (res && (res.error || res.errors || (!res.success))) {
          throw res;
        }

        return res;
      })
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
    return this.http.get<ShiftRule[]>(`${BASE_URL}/rules`).pipe(
      map((result: any) => {
        if (!result) {
          return [];
        }
        if (result.$values && Array.isArray(result.$values)) {
          return result.$values;
        }

        return result;
      })
    );
  }

  // Team rule values (team-scoped values for rules that require input)
  getTeamRuleValues(
    teamId: number
  ): Observable<TeamRuleValue[]> {
    const url = `${BASE_URL}/teamRuleValues${teamId ? `?teamId=${teamId}` : ''}`;

    return this.http.get<TeamRuleValue[]>(url).pipe(
      map((result: any) => {
        if (!result) {
          return [];
        }
        if (result.$values && Array.isArray(result.$values)) {
          return result.$values;
        }

        return result;
      })
    );
  }

  createTeamRuleValue(
    model: TeamRuleValue
  ): Observable<TeamRuleValue> {
    return this.http.post(`${BASE_URL}/teamRuleValues`, model).pipe(
      map((res: any) => {
        if (res && (res.error || res.errors || (!res.success))) {
          throw res;
        }

        return res;
      })
    );
  }

  updateTeamRuleValue(
    id: number,
    model: TeamRuleValue
  ): Observable<TeamRuleValue> {
    return this.http.put(`${BASE_URL}/teamRuleValues/${id}`, model).pipe(
      map((result: any) => {
        if (result && (result.error || result.errors || (!result.success))) {
          throw result;
        }

        return result;
      })
    );
  }

  generateSchedule(teamId: string, startDate: string, endDate: string): Observable<GeneratedSchedule> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.post<GeneratedSchedule>(`${BASE_URL}/teams/${encodeURIComponent(teamId)}/generate`, null, { params });
  }

  generateScheduleRequest(
    model: GeneratedSchedule
  ): Observable<GeneratedSchedule> {
    // Accept either camelCase or PascalCase keys and normalize to PascalCase expected by backend
    // const payload: any = {
    //   TeamId: model.teamId ?? model.Teamid ?? model.teamid,
    //   StartDate: model.StartDate ?? model.startDate ?? model.start_date,
    //   EndDate: model.EndDate ?? model.endDate ?? model.end_date
    // };
    return this.http.post(`${BASE_URL}/schedules/generate`, model).pipe(
      map((result: any) => {
        if (result && (result.error || result.errors || (!result.success))) {
          throw result;
        }

        return result;
      })
    );
  }

  // List schedules (optionally filtered by teamId)
  getSchedules(
    teamId?: number
  ): Observable<GeneratedSchedule[]> {
    const url = `${BASE_URL}/schedules${teamId ? `?teamId=${teamId}` : ''}`;
    return this.http.get<GeneratedSchedule[]>(url).pipe(
      map((result: any) => {
        if (!result) {
          return [];
        }
        if (result.$values && Array.isArray(result.$values)) {
          return result.$values;
        }

        return result;
      })
    );
  }

  getSchedule(
    id: number | string
  ): Observable<GeneratedSchedule> {
    return this.http.get<GeneratedSchedule>(`${BASE_URL}/schedules/${id}`).pipe(
      map((res: any) => {
        if (!res) {
          return null;
        }

        return res;
      })
    );
  }

  updateSchedule(
    id: string | number,
    model: GeneratedSchedule
  ) {
    return this.http.put(`${BASE_URL}/schedules/${id}`, model).pipe(
      map((result: any) => {
        if (result && (result.error || result.errors || (!result.success))) {
          throw result;
        }

        return result;
      })
    );
  }

  deleteSchedule(
    id: string | number
  ): Observable<void> {
    return this.http.delete(`${BASE_URL}/schedules/${id}`).pipe(
      map((res: any) => { 
        if (res && (res.error || res.errors || (!res.success))) {
          throw res;
        } 
        
        return; 
      })
    );
  }

  patchAssignment(
    scheduleId: number,
    dto: ScheduleAssignmentUpdateDto
  ): Observable<void> {
    return this.http.patch(`${BASE_URL}/schedules/${scheduleId}/assignment`, dto).pipe(
      map((result: any) => {
        if (result && (result.error || result.errors || (!result.success))) {
          throw result;
        }

        return result;
      })
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
