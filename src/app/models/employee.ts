export interface Employee {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  monthlyHoursTarget: number;
  isFullTime: boolean;
  role?: string;
  isActive: boolean;
}
