import { EmployeeLeave } from "./employee-leave.interface";

export interface LeaveType {
    id: number;
    name: string;
    description?: string;
    employeeLeaves?: EmployeeLeave[];
}

export function createEmptyLeaveType(): LeaveType {
    return {
        id: 0,
        name: '',
        description: ''
    };
}