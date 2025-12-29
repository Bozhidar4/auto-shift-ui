import { InputType } from "./rule-type";
import { TeamRuleValue } from "./team-rule-value.interface";

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