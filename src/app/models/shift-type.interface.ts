export interface ShiftType {
  id: number;
  teamId: number;
  name: string;
  initialCode?: string;
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  requiredPeople: number | null;
}

export function createEmptyShift(): ShiftType {
  return {
    id: 0,
    teamId: 0,
    name: '',
    initialCode: '',
    startTime: '',
    endTime: '',
    requiredPeople: null
  };
}
