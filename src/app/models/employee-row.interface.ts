import { Team } from "./team";

export interface EmployeeRow {
    id?: number;
    firstName: string;
    lastName: string;
    monthlyHoursTarget: number;
    isActive: boolean;
    teamId?: number | null;
    team?: Team | null;
    _editing?: boolean;
}