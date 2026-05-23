import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { CookieConsentComponent } from './components/cookie-consent/cookie-consent.component';
import { SITE_CONFIG } from './config/site.config';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterModule, CookieConsentComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true
})
export class App {
  constructor(
    private translate: TranslateService,
    private router: Router,
    private seo: SeoService
  ) {
    this.translate.addLangs([...SITE_CONFIG.locales]);
    this.translate.setDefaultLang(SITE_CONFIG.defaultLocale);

    const urlLang = this.seo.readLangFromUrl();
    const savedLang = localStorage.getItem('lang');
    const browserLang = navigator.language.split('-')[0];
    const supported = [...SITE_CONFIG.locales];
    const initialLang =
      urlLang ||
      (savedLang && supported.includes(savedLang as (typeof SITE_CONFIG.locales)[number]) ? savedLang : null) ||
      (supported.includes(browserLang as (typeof SITE_CONFIG.locales)[number]) ? browserLang : SITE_CONFIG.defaultLocale);

    this.translate.use(initialLang);
    localStorage.setItem('lang', initialLang);
    this.seo.syncLangQueryParam(initialLang);

    this.translate.onLangChange.subscribe((event) => {
      this.seo.setHtmlLang(event.lang);
      this.seo.updateForRoute(this.router.url);
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigation = event as NavigationEnd;
        this.seo.updateForRoute(navigation.urlAfterRedirects);
      });
  }
}
