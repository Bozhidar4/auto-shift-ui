import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  template: `
    <div class="cookie-banner" *ngIf="isVisible">
      <div class="cookie-content">
        <p>
          {{ 'COOKIES.BANNER_TEXT' | translate }}
          <a routerLink="/cookies">{{ 'COOKIES.LEARN_MORE' | translate }}</a>
        </p>
        <div class="cookie-actions">
          <button class="btn primary pill" (click)="accept()">{{ 'COOKIES.ACCEPT' | translate }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cookie-banner {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 600px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      z-index: 9999;
      border: 1px solid rgba(255, 255, 255, 0.3);
      animation: slideUp 0.5s ease-out;
    }
    @keyframes slideUp {
      from { transform: translate(-50%, 100%); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
    .cookie-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
      text-align: center;
    }
    .cookie-content p {
      margin: 0;
      font-size: 0.95rem;
      color: #475569;
      line-height: 1.5;
    }
    .cookie-content a {
      color: var(--primary);
      text-decoration: underline;
      font-weight: 500;
    }
    .cookie-actions {
      display: flex;
      gap: 1rem;
    }
    @media (min-width: 768px) {
      .cookie-content {
        flex-direction: row;
        text-align: left;
        justify-content: space-between;
      }
      .cookie-banner {
        width: auto;
        min-width: 500px;
      }
    }
  `]
})
export class CookieConsentComponent implements OnInit {
  isVisible = false;

  ngOnInit() {
    const consent = localStorage.getItem('cookie-consent');

    if (!consent && this.isEU()) {
      this.isVisible = true;
    }
  }

  isEU(): boolean {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz.startsWith('Europe/');
  }

  accept() {
    localStorage.setItem('cookie-consent', 'true');
    this.isVisible = false;
  }
}
