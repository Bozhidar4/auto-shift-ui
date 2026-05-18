import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { ContactMessage } from '../models/contact-message.interface';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  constructor(
    private apiService: ApiService
  ) { }

  async send(
    message: ContactMessage
  ): Promise<any> {
    try {
      return await firstValueFrom(this.apiService.sendContactMessage(message));
    } catch (error) {
      throw error;
    }
  }
}
