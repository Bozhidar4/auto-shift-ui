import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss'
})
export class LanguageSwitcherComponent {
  currentLang: string;
  isOpen = false;

  constructor(
    private translate: TranslateService,
    private seo: SeoService
  ) {
    this.currentLang = this.translate.getCurrentLang() || this.translate.getFallbackLang() || 'en';
    this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
    });

    document.addEventListener('click', () => {
      this.isOpen = false;
    });
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang = lang;
    this.isOpen = false;
    localStorage.setItem('lang', lang);
    this.seo.syncLangQueryParam(lang);
  }
}
