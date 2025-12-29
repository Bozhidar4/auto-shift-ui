import { Employee } from "./employee.interface";
import { ShiftType } from "./shift-type.interface";

export interface Team {
  id: number;
  name?: string | null;
  ownerId?: string | null;
  employees?: Employee[];
  shiftTypes?: ShiftType[];
  rules?: any[];
  // UI-only flag for editing state
  _editing?: boolean;
}
