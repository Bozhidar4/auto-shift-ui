interface EmployeeRow {
    id?: number;
    firstName: string;
    lastName: string;
    monthlyHoursTarget: number;
    isActive: boolean;
    teamId?: number | null;
    _editing?: boolean;
}