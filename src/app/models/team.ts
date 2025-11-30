export interface Team {
  id: number;
  name?: string | null;
  ownerId?: string | null;
  employees?: any[];
  shiftTypes?: any[];
  rules?: any[];
  // UI-only flag for editing state
  _editing?: boolean;
}
