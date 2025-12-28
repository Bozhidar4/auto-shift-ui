import { Employee } from "./employee";
import { LeaveType } from "./leave-type.interface";

export interface EmployeeLeave {
    id: number;
    employeeId: number;
    employee?: Employee | null;
    leaveTypeId: number;
    leaveType?: LeaveType | null;
    startDate: Date;
    endDate: Date;
    notes?: string | null;
}

export function createEmptyEmployeeLeave(): EmployeeLeave {
    return {
        id: 0,
        employeeId: 0,
        leaveTypeId: 0,
        startDate: new Date(),
        endDate: new Date(),
    };
}