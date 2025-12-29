import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Team } from '../../models/team';
import { ShiftRule } from '../../models/shift-rule.interface';
import { TeamRuleValue } from '../../models/team-rule-value.interface';
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
  loading: boolean = false;
  savingMap: Record<number, boolean> = {};

  constructor(
    private apiService: ApiService, 
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadTeams();
    // Load all available general rules (system rules) on page load
    this.loadAllRules();
  }

  loadTeams(): void {
    this.loading = true;
    this.apiService
      .getTeams()
      .subscribe({ next: (t) => (this.teams = t), complete: () => (this.loading = false) });
  }

  onTeamChange(): void {
    if (!this.selectedTeamId) {
      return;
    }

    // When team changes, load existing team-specific values and merge into rules
    this.loadTeamValues(this.selectedTeamId);
  }

  loadRulesForTeam(
    teamId: number
  ): void {
    this.apiService.getRules(String(teamId)).subscribe((r) => (this.rules = r || []));
  }

  loadAllRules(): void {
    this.apiService
      .getAllRules()
      .subscribe({
        next: (r) => {
          // normalize rule fields to our ShiftRule interface
          this.rules = (r || []).map((x: any) => {
            const shiftRule: ShiftRule = {
              id: x.id ?? x.ID ?? x.ruleId ?? 0,
              type: x.type ?? x.key ?? x.name ?? null,
              name: x.name ?? x.key ?? x.type ?? null,
              key: x.key ?? x.type ?? null,
              description: x.description ?? x.Description ?? null,
              requiresInput: (x.requiresInput ?? x.RequiresInput ?? ((x.inputType ?? x.InputType) ? true : false)) as boolean,
              inputType: (x.inputType ?? x.InputType ?? (x.valueType ?? null)) as any,
              teamValue: null
            };

            return shiftRule;
          });
        }, error: () => { this.rules = []; }
      });
  }

  loadTeamValues(
    teamId: number
  ): void {
    this.apiService.getTeamRuleValues(teamId).subscribe({
      next: (v: any) => {
        const raw = v || [];

        // Flatten: include top-level entries and any nested team.teamRuleValues.$values
        const flat: any[] = [];
        (raw as any[]).forEach(item => {
          if (!item) return;
          const nested = item.team?.teamRuleValues?.$values;
          if (Array.isArray(nested)) flat.push(...nested);
          // also include the top-level entry when it looks like a teamRuleValue
          if (item.ruleId !== undefined || item.id !== undefined || item.rule) flat.push(item);
        });

        // Normalize by ruleId, prefer later items (they overwrite earlier)
        const byRuleId = new Map<number, TeamRuleValue>();
        flat.forEach(tv => {
          const ruleId = Number(tv.ruleId ?? tv.RuleId ?? tv.rule?.id ?? 0);
          if (!ruleId) return;
          const normalized: TeamRuleValue = {
            id: Number(tv.id ?? tv.ID ?? 0),
            teamId: Number(tv.teamId ?? tv.TeamId ?? tv.team?.id ?? teamId),
            ruleId,
            value: tv.value ?? tv.Value ?? tv.val ?? null
          };
          byRuleId.set(ruleId, normalized);

          // Merge returned rule metadata into our rules list
          const ruleMeta = tv.rule ?? tv.Rule;
          if (ruleMeta && ruleMeta.id !== undefined) {
            const rid = Number(ruleMeta.id);
            const inputType = (ruleMeta.valueType ?? ruleMeta.ValueType ?? ruleMeta.valueType) as any;
            let existing = this.rules.find(r => r.id === rid);
            if (!existing) {
              existing = {
                id: rid,
                type: ruleMeta.code ?? ruleMeta.key ?? null,
                name: ruleMeta.name ?? null,
                key: ruleMeta.code ?? null,
                description: ruleMeta.description ?? null,
                requiresInput: (ruleMeta.requiresInput ?? false) as boolean,
                inputType: inputType ?? null,
                teamValue: null
              } as ShiftRule;
              this.rules.push(existing);
            } else {
              existing.name = ruleMeta.name ?? existing.name;
              existing.description = ruleMeta.description ?? existing.description;
              existing.requiresInput = (ruleMeta.requiresInput ?? existing.requiresInput) as boolean;
              existing.inputType = inputType ?? existing.inputType;
            }
          }
        });

        this.teamValues = Array.from(byRuleId.values());

        // Attach teamValue into rules for template binding
        this.rules = this.rules.map(r => ({ ...r, teamValue: this.teamValues.find(tv => tv.ruleId === r.id) || null } as ShiftRule));
      },
      error: (err) => {
        this.toastService.show('Failed to load team rule values', 'error');
      }
    });
  }

  getValueForRule(
    rule: ShiftRule
  ): string | number | null | undefined {
    if (rule.teamValue) {
      return rule.teamValue.value;
    }

    const found = this.teamValues.find((tv) => tv.ruleId === rule.id);
    return found ? found.value : null;
  }

  isInvalidIntValue(
    rule: ShiftRule
  ): boolean {
    if (!(!rule.inputType || rule.inputType === 'int')) {
      return false;
    }

    const value = this.getValueForRule(rule);

    if (!value) {
      return false;
    }

    const numberValue = Number(value);

    return !Number.isFinite(numberValue) || numberValue < 1;
  }

  setValueForRule(
    rule: ShiftRule,
    newValue: number | string
  ): void {
    // store value locally until saved
    if (rule.teamValue) {
      rule.teamValue.value = newValue;
      return;
    }
    const existing = this.teamValues.find((tv) => tv.ruleId === rule.id);

    if (existing) {
      existing.value = newValue;
    } else {
      const teamRuleValue: TeamRuleValue = {
        id: 0,
        teamId: this.selectedTeamId as number,
        ruleId: rule.id,
        value: newValue
      };

      this.teamValues.push(teamRuleValue);
      rule.teamValue = teamRuleValue;
    }
  }

  saveRuleValue(
    rule: ShiftRule
  ): void {
    if (!this.selectedTeamId) {
      this.toastService.show('Select a team first to save values', 'warning');
      return;
    }
    if (this.isInvalidIntValue(rule)) {
      this.toastService.show('Please enter a valid integer value (minimum 1)', 'warning');
      return;
    }

    const existing = rule.teamValue && rule.teamValue.id && rule.teamValue.id > 0 ? rule.teamValue : null;
    // ensure value is sent as string (backend expects string)
    const rawVal = rule.teamValue ? rule.teamValue.value : null;
    const payload: TeamRuleValue = {
      id: existing ? existing.id : 0,
      teamId: this.selectedTeamId,
      ruleId: rule.id,
      value: rawVal === null || rawVal === undefined ? null : String(rawVal)
    };

    this.savingMap[rule.id] = true;

    if (existing) {
      this.apiService.updateTeamRuleValue(existing.id, payload).subscribe({ next: (result) => {
        this.savingMap[rule.id] = false;
        this.loadTeamValues(this.selectedTeamId as number);
        this.toastService.show('Rule value updated', 'success');
      }, error: (error) => {
        this.savingMap[rule.id] = false;
        this.toastService.show('Failed to update rule value', 'error');
      } });
    } else {
      this.apiService.createTeamRuleValue(payload).subscribe({ next: (result) => {
        this.savingMap[rule.id] = false;
        this.loadTeamValues(this.selectedTeamId as number);
        this.toastService.show('Rule value created', 'success');
      }, error: (error) => {
        this.savingMap[rule.id] = false;
        this.toastService.show('Failed to create rule value', 'error');
      } });
    }
  }
}
