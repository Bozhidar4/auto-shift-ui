import { Employee } from "./employee.interface";
import { LeaveType } from "./leave-type.interface";

export interface EmployeeLeave {
    id: number;
    employeeId: number | null;
    employee?: Employee | null;
    leaveTypeId: number | null;
    leaveType?: LeaveType | null;
    startDate: Date | string | null;
    endDate: Date | string | null;
    notes?: string | null;
}

export interface EmployeeLeaveDto {
    id: number;
    employeeId: number | null;
    leaveTypeId: number | null;
    startDate: string | null;
    endDate: string | null;
    notes?: string | null;
}

export function createEmptyEmployeeLeave(): EmployeeLeave {
    return {
        id: 0,
        employeeId: null,
        leaveTypeId: null,
        startDate: new Date(),
        endDate: new Date(),
    };
}