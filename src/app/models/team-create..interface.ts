import { Employee } from "./employee.interface";
import { ShiftType } from "./shift-type.interface";

export interface TeamCreate {
    name: string;
    employees?: Employee[];
    shiftTypes?: ShiftType[];
}