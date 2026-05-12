import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule, MatIconModule],
  template: `
    <div class="legal-container">
      <div class="legal-card card">
        <button class="btn-back" routerLink="/">
          <mat-icon>arrow_back</mat-icon> {{ 'COMMON.BACK' | translate }}
        </button>
        
        <div class="legal-content">
          <h1>{{ 'LEGAL.TERMS_TITLE' | translate }}</h1>
          <p class="last-updated">{{ 'LEGAL.LAST_UPDATED' | translate }}: May 12, 2026</p>
          
          <div class="legal-section" [innerHTML]="'LEGAL.TERMS_CONTENT' | translate"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .legal-container {
      min-height: 100vh;
      background: #f8fafc;
      padding: 4rem 2rem;
      display: flex;
      justify-content: center;
    }
    .legal-card {
      max-width: 900px;
      width: 100%;
      padding: 3rem;
      background: white;
    }
    .btn-back {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      color: var(--primary);
      cursor: pointer;
      font-weight: 600;
      margin-bottom: 2rem;
      padding: 0;
    }
    .legal-content h1 {
      font-size: 2.5rem;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }
    .last-updated {
      color: #64748b;
      font-size: 0.9rem;
      margin-bottom: 3rem;
    }
    ::ng-deep .legal-section h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #334155;
      margin: 2.5rem 0 1rem;
    }
    ::ng-deep .legal-section p {
      line-height: 1.7;
      color: #475569;
      margin-bottom: 1.25rem;
    }
    ::ng-deep .legal-section ul {
      margin-bottom: 1.5rem;
      padding-left: 1.5rem;
    }
    ::ng-deep .legal-section li {
      margin-bottom: 0.5rem;
      color: #475569;
      line-height: 1.6;
    }
  `]
})
export class TermsComponent {}
