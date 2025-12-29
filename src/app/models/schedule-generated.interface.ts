import { ScheduleAssignment } from "./schedule-assignment.interface";

export interface GeneratedSchedule {
    id: number;
    teamId: string;
    startDate: string;
    endDate: string;
    assignments: ScheduleAssignment[];
}