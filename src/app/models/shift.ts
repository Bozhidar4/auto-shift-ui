export interface ShiftType {
  id: number;
  teamId: number;
  name: string;
  code?: string;
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  requiredPeople: number;
}
