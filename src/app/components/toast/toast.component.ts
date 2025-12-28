import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})

export class ToastComponent {
  constructor(
    public toast: ToastService
  ) {
    this.toast.messages$.subscribe(m => console.debug('[ToastComponent] messages', m));
  }
}
