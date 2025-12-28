export interface Employee {
  id: number;
  teamId: number | null;
  firstName: string;
  lastName: string;
  monthlyHoursTarget: number;
  // isFullTime: boolean;
  // role?: string;
  isActive: boolean;
}
