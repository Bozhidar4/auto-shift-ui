import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'info' | 'success' | 'error' | 'warning';
export interface ToastMessage { id: string; text: string; type: ToastType }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _messages = new BehaviorSubject<ToastMessage[]>([]);
  messages$ = this._messages.asObservable();

  show(text: string, type: ToastType = 'info', timeout = 7000) {
    console.debug('[ToastService] show', { text, type, timeout });
    const id = Math.random().toString(36).slice(2, 9);
    const msg: ToastMessage = { id, text, type };
    this._messages.next([...this._messages.value, msg]);
    if (timeout > 0) {
      setTimeout(() => this.dismiss(id), timeout);
    }
    return id;
  }

  dismiss(id: string) {
    console.debug('[ToastService] dismiss', id);
    this._messages.next(this._messages.value.filter(m => m.id !== id));
  }

  clear() { this._messages.next([]); }
}
