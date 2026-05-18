import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
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
export class FeedbackComponent implements OnInit {
  @ViewChild('feedbackFormRef') feedbackFormRef!: NgForm;
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

  ngOnInit(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payloadStr = atob(token.split('.')[1]);
        const payload = JSON.parse(payloadStr);
        debugger
        const email = payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '';
        const name = payload.name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || email.split('@')[0] || 'App User';

        this.feedbackForm.email = email;
        this.feedbackForm.name = name;
      } catch (e) {
        // Token parsing failed, ignore
      }
    }
  }

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
      const response = await this.emailService.send(this.feedbackForm);

      const msg = response?.message || this.translate.instant('CONTACT.SUCCESS');
      this.toast.show(msg, 'success');

      const defaultState = {
        name: this.feedbackForm.name, // preserve the extracted user name
        email: this.feedbackForm.email, // preserve the extracted user email
        type: 'FEEDBACK',
        message: '',
        rating: 0,
        page: 'App Feedback'
      };

      if (this.feedbackFormRef) {
        this.feedbackFormRef.resetForm(defaultState);
      }
      this.feedbackForm = defaultState;
    } catch (error) {
      this.toast.show(this.translate.instant('CONTACT.ERROR'), 'error');
    } finally {
      this.isSending = false;
    }
  }
}
