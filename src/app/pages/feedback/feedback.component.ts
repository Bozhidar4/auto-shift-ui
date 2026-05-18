import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EmailService } from '../../services/email.service';
import { ToastService } from '../../services/toast.service';
import { ContactMessage } from '../../models/contact-message.interface';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, TranslateModule],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent {
  feedbackForm: ContactMessage = {
    name: '',
    email: '',
    type: 'FEEDBACK',
    message: '',
    rating: 0,
    page: 'App Feedback'
  };
  isSending = false;

  constructor(
    private translate: TranslateService,
    private emailService: EmailService,
    private toast: ToastService
  ) { }

  setRating(
    rating: number
  ): void {
    this.feedbackForm.rating = rating;
  }

  async submitFeedback(): Promise<void> {
    if (!this.feedbackForm.message) {
      return;
    }

    this.isSending = true;
    try {
      await this.emailService.send(this.feedbackForm);

      this.toast.show(this.translate.instant('CONTACT.SUCCESS'), 'success');

      this.feedbackForm = {
        name: '',
        email: '',
        type: 'FEEDBACK',
        message: '',
        rating: 0,
        page: 'App Feedback'
      };
    } catch (error) {
      this.toast.show(this.translate.instant('CONTACT.ERROR'), 'error');
    } finally {
      this.isSending = false;
    }
  }
}
