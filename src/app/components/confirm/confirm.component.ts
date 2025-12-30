import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent {
  @Input() title: string | null = null;
  @Input() message: string | null = null;
  @Input() visible = false;
  // Optional custom labels for the action buttons. If not provided, template falls back to defaults.
  @Input() confirmLabel: string | null = null;
  @Input() cancelLabel: string | null = null;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
    this.visible = false;
  }

  onCancel() {
    this.cancelled.emit();
    this.visible = false;
  }
}
