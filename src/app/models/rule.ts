export type RuleType =
  | 'NO_EARLY_AFTER_NIGHT'
  | 'MIN_REST_HOURS'
  | 'MAX_CONSECUTIVE_SHIFTS'
  | 'MONTHLY_HOUR_RANGE'
  | 'EMPLOYEE_ONLY_SHIFT_TYPE'
  | 'ONE_SHIFT_PER_DAY'
  | 'MIN_DAYS_OFF'
  | 'MAX_HOURS_PERIOD'
  | 'FAIR_DISTRIBUTION'
  | 'MIN_REQUIRED_STAFF'
  | 'EMP_AVAILABILITY';

export type InputType = 'int' | 'string' | null;

export interface TeamRuleValue {
  id: number;
  teamId: number;
  ruleId: number;
  value?: string | number | null;
}

export interface ShiftRule {
  id: number;
  type?: string | null;
  name?: string | null;
  description?: string | null;
  key?: string | null;
  requiresInput?: boolean;
  inputType?: InputType;
  teamValue?: TeamRuleValue | null;
}
