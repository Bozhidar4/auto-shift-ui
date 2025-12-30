import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Team } from '../models/team';
import { Employee } from '../models/employee.interface';
import { ShiftType } from '../models/shift-type.interface';
import { EmployeeLeave, EmployeeLeaveDto } from '../models/employee-leave.interface';
import { LeaveType } from '../models/leave-type.interface';
import { ScheduleAssignmentUpdateDto } from '../models/schedule-assignment-update.interface';
import { TeamCreate } from '../models/team-create..interface';
import { ShiftRule } from '../models/shift-rule.interface';
import { TeamRuleValue } from '../models/team-rule-value.interface';
import { GeneratedSchedule } from '../models/schedule-generated.interface';

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

  createTeam(
    model: TeamCreate
  ): Observable<Team> {
    return this.http.post(`${BASE_URL}/teams`, model).pipe(
      map((response: any) => { 
        if (response && (response.error || response.errors || !response.success)) {
          throw response;
        } 
        
        return response; 
      })
    );
  }

  updateTeam(
    id: number,
    model: TeamCreate
  ): Observable<Team> {
    return this.http.put(`${BASE_URL}/teams/${id}`, model).pipe(
      map((response: any) => {
        if (response && (response.error || response.errors)) {
          throw response;
        }

        return response;
      })
    );
  }

  deleteTeam(
    id: number
  ): Observable<void> {
    return this.http.delete(`${BASE_URL}/teams/${id}`).pipe(
      map((response: any) => {
        if (response && (response.error || response.errors || !response.success)) {
          throw response;
        }

        return response;
      })
    );
  }

  getTeamById(
    id: number
  ): Observable<Team> {
    return this.http.get<Team>(`${BASE_URL}/teams/${id}`).pipe(
      map((response: any) => {
        if (!response) {
          return null;
        }

        if (response.$values && Array.isArray(response.$values)) {
          return response.$values[0];
        }

        return response;
      })
    );
  }

  getEmployees(
    teamId: string
  ): Observable<Employee[]> {
    return this.http.get<any>(`${BASE_URL}/teams/${encodeURIComponent(teamId)}/employees`).pipe(
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

  createEmployee(
    model: Employee
  ): Observable<Employee> {
    return this.http.post(`${BASE_URL}/employees`, model).pipe(
      map((response: any) => {
        if (response && (response.error || response.errors)) {
          throw response;
        }

        return response;
      })
    );
  }

  updateEmployee(
    id: number,
    model: Employee
  ): Observable<Employee> {
    return this.http.put(`${BASE_URL}/employees/${id}`, model).pipe(
      map((response: any) => {
        if (response && (response.error || response.errors)) {
          throw response;
        }

        return response;
      })
    );
  }

  deleteEmployee(
    id: number
  ): Observable<void> {
    return this.http.delete(`${BASE_URL}/employees/${id}`).pipe(
      map((response: any) => {
        if (response && (response.error || response.errors || !response.success)) {
          throw response;
        }

        return response;
      })
    );
  }

  getShiftTypes(
    teamId?: number
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

  getShiftTypeById(
    id: number
  ): Observable<ShiftType> {
    return this.http.get<ShiftType>(`${BASE_URL}/shifts/${id}`);
  }

  createShiftType(
    model: ShiftType
  ): Observable<ShiftType> {
    return this.http.post(`${BASE_URL}/shifts`, model).pipe(
      map((res: any) => {
        if (res && (res.error || res.errors)) {
          throw res;
        }

        return res;
      })
    );
  }

  updateShiftType(
    model: ShiftType
  ): Observable<ShiftType> {
    return this.http.put(`${BASE_URL}/shifts/${model.id}`, model).pipe(
      map((res: any) => {
        if (res && (res.error || res.errors)) {
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
        if (res && (res.error || res.errors)) {
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
    model: EmployeeLeaveDto
  ): Observable<any> {
    return this.http.post(`${BASE_URL}/employeeLeaves`, model).pipe(
      map((response: any) => {
        if (response && (response.error || response.errors)) {
          throw response;
        }

        return response;
      })
    );
  }

  updateEmployeeLeave(
    id: number,
    model: EmployeeLeaveDto
  ): Observable<EmployeeLeave> {
    return this.http.put(`${BASE_URL}/employeeLeaves/${id}`, model).pipe(
      map((response: any) => {
        if (response && (response.error || response.errors)) {
          throw response;
        }

        return response;
      })
    );
  }

  deleteEmployeeLeave(
    id: number
  ): Observable<void> {
    return this.http.delete(`${BASE_URL}/employeeLeaves/${id}`).pipe(
      map((res: any) => {
        if (res && (res.error || res.errors)) {
          throw res;
        }

        return res;
      })
    );
  }

  // Leave types
  createLeaveType(
    model: LeaveType
  ): Observable<LeaveType> {
    return this.http.post(`${BASE_URL}/leaveTypes`, model).pipe(
      map((res: any) => {
        if (res && (res.error || res.errors)) {
          throw res;
        }

        return res;
      })
    );
  }

  getLeaveTypeById(
    id: number
  ): Observable<LeaveType> {
    return this.http.get<LeaveType>(`${BASE_URL}/leaveTypes/${id}`);
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
        if (res && (res.error || res.errors)) {
          throw res;
        }

        return res;
      })
    );
  }

  deleteLeaveType(
    id: number
  ): Observable<void> {
    return this.http.delete(`${BASE_URL}/leaveTypes/${id}`).pipe(
      map((res: any) => {
        if (res && (res.error || res.errors)) {
          throw res;
        }

        return res;
      })
    );
  }

  getRules(
    teamId: string
  ): Observable<ShiftRule[]> {
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
        if (res && (res.error || res.errors)) {
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
      map((response: any) => {
        if (response && (response.error || response.errors)) {
          throw response;
        }

        return response;
      })
    );
  }

  generateSchedule(
    teamId: string,
    startDate: string,
    endDate: string
  ): Observable<GeneratedSchedule> {
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
      map((response: any) => {
        if (response && (response.error || response.errors)) {
          throw response;
        }

        return response;
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
      map((response: any) => {
        if (response && (response.error || response.errors)) {
          throw response;
        }

        return response;
      })
    );
  }

  deleteSchedule(
    id: string | number
  ): Observable<void> {
    return this.http.delete(`${BASE_URL}/schedules/${id}`).pipe(
      map((res: any) => { 
        if (res && (res.error || res.errors)) {
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
      map((response: any) => {
        if (response && (response.error || response.errors)) {
          throw response;
        }

        return response;
      })
    );
  }

  // Delete an assignment (used when marking a day as OFF / null shift)
  deleteAssignment(
    scheduleId: number,
    employeeId: number,
    dateStr: string
  ): Observable<void> {
    const params = new HttpParams()
      .set('employeeId', String(employeeId))
      .set('date', dateStr);

    return this.http.delete(`${BASE_URL}/schedules/${scheduleId}/assignment`, { params }).pipe(
      map((res: any) => {
        if (res && (res.error || res.errors)) {
          throw res;
        }

        return;
      })
    );
  }

  getEmployeeHours(
    scheduleId: number
  ): Observable<any> {
    return this.http.get<any>(`${BASE_URL}/schedules/${scheduleId}/hours`).pipe(
      map((res: any) => {
        if (!res) return [];
        if (res.$values && Array.isArray(res.$values)) return res.$values;
        return res;
      })
    );
  }

  login(
    email: string,
    password: string
  ): Observable<any> {
    return this.http.post(`${BASE_URL}/auth/login`, { email, password }).pipe(
      map((res: any) => {
        if (res && (res.error || res.errors)) {
          throw res;
        }

        return res;
      })
    );
  }

  // Diagnostic: try multiple payload shapes for login; suppress global toasts via header
  loginFlexible(
    email: string, 
    password: string
  ): Observable<any> {
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

  register(
    email: string, 
    password: string, 
    displayName?: string
  ): Observable<any> {
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
}
