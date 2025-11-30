import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss']
})
export class SchedulesComponent {
  schedule: any | null = null;
  constructor(private api: ApiService) {}
  generate() {
    this.api.generateSchedule('team-1', new Date().toISOString(), new Date().toISOString()).subscribe((s) => (this.schedule = s));
  }
  download() {
    if (!this.schedule) return;
    const blob = new Blob([JSON.stringify(this.schedule, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}
