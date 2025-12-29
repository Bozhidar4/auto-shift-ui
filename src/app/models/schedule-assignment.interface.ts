export interface ScheduleAssignment {
  id: string;
  scheduleId: string;
  employeeId: string;
  shiftTypeId: string;
  date: string; // ISO date
}
