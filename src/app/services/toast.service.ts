import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'info' | 'success' | 'error' | 'warning';
export interface ToastMessage { id: string; text: string; type: ToastType; timeout: number }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _messages = new BehaviorSubject<ToastMessage[]>([]);
  messages$ = this._messages.asObservable();

  show(
    text: string,
    type: ToastType = 'info',
    timeout = 7000
  ): string {
    console.debug('[ToastService] show', { text, type, timeout });
    const id = Math.random().toString(36).slice(2, 9);
    const msg: ToastMessage = { id, text, type, timeout };
    this._messages.next([...this._messages.value, msg]);

    return id;
  }

  dismiss(
    id: string
  ): void {
    console.debug('[ToastService] dismiss', id);
    this._messages.next(this._messages.value.filter(m => m.id !== id));
  }

  clear(): void {
    this._messages.next([]);
  }
}
