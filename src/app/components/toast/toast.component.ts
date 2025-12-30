import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})

export class ToastComponent implements OnDestroy {
  // timers: duration (ms), expiresAt (timestamp), timeoutId when running, paused flag, remaining when paused
  private timers = new Map<string, { duration: number; expiresAt: number; timeoutId?: any; paused?: boolean; remaining?: number }>();
  private progress = new Map<string, number>();
  private tickerId: any;

  constructor(
    public toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    // whenever messages change, start timers for new messages
    this.toast.messages$.subscribe(messages => {
      // start timers for new messages
      for (const m of messages) {
        if (!this.timers.has(m.id) && m.timeout > 0) {
          this.startTimer(m.id, m.timeout);
        }
      }

      // clear timers for removed messages
      const ids = new Set(messages.map(x => x.id));
      for (const id of Array.from(this.timers.keys())) {
        if (!ids.has(id)) {
          this.clearTimer(id);
        }
      }
    });

    // start periodic updater to compute progress and trigger change detection
    this.tickerId = setInterval(() => {
      this.updateProgress();
      this.cdr.detectChanges();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.tickerId) {
      clearInterval(this.tickerId);
    }
    // clear timers
    for (const id of Array.from(this.timers.keys())) {
      this.clearTimer(id);
    }
  }

  onMouseEnter(
    id: string
  ): void {
    const timer = this.timers.get(id);
    if (!timer || timer.paused) {
      return;
    }

    // pause
    if (timer.timeoutId) {
      clearTimeout(timer.timeoutId);
      timer.timeoutId = undefined;
    }

    timer.remaining = Math.max(0, timer.expiresAt - Date.now());
    timer.paused = true;
    this.timers.set(id, timer);
  }

  onMouseLeave(
    id: string
  ): void {
    const timer = this.timers.get(id);
    if (!timer || !timer.paused) {
      return;
    }

    // resume
    const remaining = timer.remaining ?? 0;
    timer.expiresAt = Date.now() + remaining;
    timer.timeoutId = setTimeout(() => this.onTimerComplete(id), remaining);
    timer.paused = false;
    delete timer.remaining;
    this.timers.set(id, timer);
  }

  getProgress(
    id: string
  ): number {
    return this.progress.get(id) ?? 0;
  }

  private updateProgress(): void {
    const now = Date.now();
    for (const [id, t] of this.timers) {
      let percent = 0;

      if (t.paused) {
        const consumed = t.duration - (t.remaining ?? 0);
        percent = Math.min(100, Math.max(0, (consumed / t.duration) * 100));
      } else {
        const remaining = Math.max(0, t.expiresAt - now);
        const consumed = t.duration - remaining;
        percent = Math.min(100, Math.max(0, (consumed / t.duration) * 100));
      }

      this.progress.set(id, percent);
    }
  }

  private startTimer(
    id: string,
    ms: number
  ): void {
    const expiresAt = Date.now() + ms;
    const timeoutId = setTimeout(() => this.onTimerComplete(id), ms);
    this.timers.set(id, { duration: ms, expiresAt, timeoutId, paused: false });
    this.progress.set(id, 0);
  }

  private clearTimer(
    id: string
  ): void {
    const timer = this.timers.get(id);

    if (timer) {
      if (timer.timeoutId) clearTimeout(timer.timeoutId);
      this.timers.delete(id);
    }

    this.progress.delete(id);
  }

  private onTimerComplete(
    id: string
  ): void {
    this.timers.delete(id);
    this.progress.delete(id);
    this.toast.dismiss(id);
  }
}
