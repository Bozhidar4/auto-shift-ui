export interface ScheduleAssignmentUpdateDto {
    employeeId: number;
    date: Date;
    newShiftTypeId?: number;
}