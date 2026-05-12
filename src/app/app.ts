import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true
})
export class App {
  protected readonly title = signal('auto-shift-ui');

  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'bg']);
    this.translate.setDefaultLang('en');

    // 1. Check localStorage
    // 2. Check browser language
    // 3. Fallback to bg
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      this.translate.use(savedLang);
    } else {
      const browserLang = navigator.language.split('-')[0]; // get 'en' from 'en-US'
      const supported = ['en', 'bg'];
      const defaultLang = supported.includes(browserLang) ? browserLang : 'en';
      this.translate.use(defaultLang);
      localStorage.setItem('lang', defaultLang);
    }
  }
}
