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

export function createEmptyEmployee(): Employee {
  return {
    id: 0,
    teamId: null,
    firstName: '',
    lastName: '',
    monthlyHoursTarget: 160,
    // isFullTime: true,
    isActive: true
  };
}