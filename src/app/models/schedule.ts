export interface ScheduleAssignment {
  id: string;
  scheduleId: string;
  employeeId: string;
  shiftTypeId: string;
  date: string; // ISO date
}

export interface GeneratedSchedule {
  id: string;
  teamId: string;
  startDate: string;
  endDate: string;
  assignments: ScheduleAssignment[];
}
