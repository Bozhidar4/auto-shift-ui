import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Team } from '../../models/team';
import { ShiftRule, TeamRuleValue } from '../../models/rule';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit {
  teams: Team[] = [];
  selectedTeamId: number | null = null;
  rules: ShiftRule[] = [];
  teamValues: TeamRuleValue[] = [];
  loading = false;
  savingMap: Record<number, boolean> = {};

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.loadTeams();
    // Load all available general rules (system rules) on page load
    this.loadAllRules();
  }

  loadTeams() {
    this.loading = true;
    this.api.getTeams().subscribe({ next: (t) => (this.teams = t), complete: () => (this.loading = false) });
  }

  onTeamChange() {
    if (!this.selectedTeamId) return;
    // When team changes, load existing team-specific values and merge into rules
    this.loadTeamValues(this.selectedTeamId);
  }

  loadRulesForTeam(teamId: number) {
    this.api.getRules(String(teamId)).subscribe((r) => (this.rules = r || []));
  }

  loadAllRules() {
    this.api.getAllRules().subscribe({ next: (r) => {
        // normalize rule fields to our ShiftRule interface
        this.rules = (r || []).map((x: any) => {
          const sr: ShiftRule = {
            id: x.id ?? x.ID ?? x.ruleId ?? 0,
            type: x.type ?? x.key ?? x.name ?? null,
            name: x.name ?? x.key ?? x.type ?? null,
            key: x.key ?? x.type ?? null,
            description: x.description ?? x.Description ?? null,
            requiresInput: (x.requiresInput ?? x.RequiresInput ?? ((x.inputType ?? x.InputType) ? true : false)) as boolean,
            inputType: (x.inputType ?? x.InputType ?? (x.valueType ?? null)) as any,
            teamValue: null
          };
          return sr;
        });
      }, error: () => { this.rules = []; } });
  }

  loadTeamValues(teamId: number) {
    this.api.getTeamRuleValues(teamId).subscribe((v) => {
      const raw = v || [];

      // collect top-level items and nested team.teamRuleValues.$values arrays
      const collected: any[] = [];
      (raw as any[]).forEach(entry => {
        if (!entry) return;
        // if entry has nested teamRuleValues, collect them
        const nested = entry.team?.teamRuleValues?.$values;
        if (Array.isArray(nested)) collected.push(...nested);
        // also collect the top-level entry
        collected.push(entry);
      });

      // filter out $ref-only placeholders and invalids
      const items = collected.filter(x => x && (x.id !== undefined || x.ruleId !== undefined || (x.rule && x.rule.id !== undefined)));

      // dedupe by id when possible, otherwise by ruleId
      const byId = new Map<number, any>();
      const byRule = new Map<number, any>();
      items.forEach(it => {
        const id = it.id ?? it.ID;
        const rid = it.ruleId ?? it.RuleId ?? it.rule?.id;
        if (id !== undefined && id !== null) {
          if (!byId.has(id)) byId.set(id, it);
        } else if (rid !== undefined && rid !== null) {
          if (!byRule.has(rid)) byRule.set(rid, it);
        }
      });

      const deduped = [...byId.values(), ...byRule.values()];

      const normalized: TeamRuleValue[] = deduped.map((tv: any) => ({
        id: tv.id ?? tv.ID ?? 0,
        teamId: tv.teamId ?? tv.TeamId ?? tv.TeamID ?? tv.team?.id ?? teamId,
        ruleId: tv.ruleId ?? tv.RuleId ?? tv.RuleID ?? tv.rule?.id ?? 0,
        value: tv.value ?? tv.Value ?? tv.val ?? null
      } as TeamRuleValue));

      // Merge nested rule metadata into rules list (if the server returned rule details)
      deduped.forEach((tv: any) => {
        const ruleMeta = tv.rule ?? tv.Rule;
        if (ruleMeta && ruleMeta.id !== undefined) {
          const rid = ruleMeta.id;
          const existingRule = this.rules.find(r => r.id === rid);
          const inputType = (ruleMeta.valueType ?? ruleMeta.ValueType ?? ruleMeta.valueType) as any;
          if (existingRule) {
            existingRule.name = ruleMeta.name ?? existingRule.name;
            existingRule.description = ruleMeta.description ?? existingRule.description;
            existingRule.requiresInput = (ruleMeta.requiresInput ?? ruleMeta.RequiresInput ?? existingRule.requiresInput) as boolean;
            existingRule.inputType = inputType ?? existingRule.inputType;
          } else {
            const sr: ShiftRule = {
              id: ruleMeta.id,
              type: ruleMeta.code ?? ruleMeta.key ?? null,
              name: ruleMeta.name ?? null,
              key: ruleMeta.code ?? null,
              description: ruleMeta.description ?? null,
              requiresInput: (ruleMeta.requiresInput ?? false) as boolean,
              inputType: inputType ?? null,
              teamValue: null
            };
            this.rules.push(sr);
          }
        }
      });

      this.teamValues = normalized;

      // merge into rules so template shows existing values
      this.rules = this.rules.map(r => {
        const found = this.teamValues.find(tv => tv.ruleId === r.id);
        return { ...r, teamValue: found || null } as ShiftRule;
      });
    }, err => {
      this.toast.show('Failed to load team rule values', 'error');
    });
  }

  getValueForRule(rule: ShiftRule) {
    if (rule.teamValue) return rule.teamValue.value;
    const found = this.teamValues.find((tv) => tv.ruleId === rule.id);
    return found ? found.value : null;
  }

  isInvalidIntValue(rule: ShiftRule) {
    if (!(rule.inputType === 'int' || rule.inputType === null)) return false;
    const v = this.getValueForRule(rule);
    if (v === null || v === undefined) return false;
    const n = Number(v);
    return !Number.isFinite(n) || n < 1;
  }

  setValueForRule(rule: ShiftRule, newValue: any) {
    // store value locally until saved
    if (rule.teamValue) {
      rule.teamValue.value = newValue;
      return;
    }
    const existing = this.teamValues.find((tv) => tv.ruleId === rule.id);
    if (existing) {
      existing.value = newValue;
    } else {
      const tv: TeamRuleValue = { id: 0, teamId: this.selectedTeamId as number, ruleId: rule.id, value: newValue };
      this.teamValues.push(tv);
      rule.teamValue = tv;
    }
  }

  saveRuleValue(rule: ShiftRule) {
    if (!this.selectedTeamId) {
      this.toast.show('Select a team first to save values', 'warning');
      return;
    }
    // Validate integer inputs: must be >= 1
    if (this.isInvalidIntValue(rule)) {
      this.toast.show('Please enter a valid integer value (minimum 1)', 'warning');
      return;
    }
    const existing = rule.teamValue && rule.teamValue.id && rule.teamValue.id > 0 ? rule.teamValue : null;
    // ensure value is sent as string (backend expects string)
    const rawVal = rule.teamValue ? rule.teamValue.value : null;
    const payload: any = { TeamId: this.selectedTeamId, RuleId: rule.id, Value: rawVal === null || rawVal === undefined ? null : String(rawVal) };
    this.savingMap[rule.id] = true;
    if (existing) {
      this.api.updateTeamRuleValue(existing.id, payload).subscribe({ next: (res: any) => {
        this.savingMap[rule.id] = false;
        this.loadTeamValues(this.selectedTeamId as number);
        this.toast.show('Rule value updated', 'success');
      }, error: (err: any) => {
        this.savingMap[rule.id] = false;
        this.toast.show('Failed to update rule value', 'error');
      } });
    } else {
      this.api.createTeamRuleValue(payload).subscribe({ next: (res: any) => {
        this.savingMap[rule.id] = false;
        this.loadTeamValues(this.selectedTeamId as number);
        this.toast.show('Rule value created', 'success');
      }, error: (err: any) => {
        this.savingMap[rule.id] = false;
        this.toast.show('Failed to create rule value', 'error');
      } });
    }
  }
}
