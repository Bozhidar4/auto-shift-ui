export type RuleType =
  | 'NO_EARLY_AFTER_NIGHT'
  | 'MIN_REST_HOURS'
  | 'MAX_CONSECUTIVE_SHIFTS'
  | 'MONTHLY_HOUR_RANGE'
  | 'EMPLOYEE_ONLY_SHIFT_TYPE';

export interface ShiftRule {
  id: string;
  teamId: string;
  type: RuleType;
  value1?: number | string;
  value2?: number | string;
  description?: string;
}
