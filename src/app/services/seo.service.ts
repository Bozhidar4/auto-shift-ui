import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { SITE_CONFIG } from '../config/site.config';

export interface SeoPageConfig {
  title: string;
  description: string;
  keywords?: string;
  path?: string;
  imagePath?: string;
  imageAlt?: string;
  robots?: string;
  type?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly jsonLdScriptId = 'app-json-ld';

  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object,
    private translate: TranslateService
  ) {}

  updateFromKey(translationKey: string, path = '/', options?: { robots?: string }): void {
    const title = this.translate.instant(`${translationKey}.TITLE`);
    const description = this.translate.instant(`${translationKey}.DESCRIPTION`);
    const keywords = this.translate.instant(`${translationKey}.KEYWORDS`);
    const imageAlt = this.translate.instant(`${translationKey}.OG_IMAGE_ALT`);

    this.setPage({
      title,
      description,
      keywords: keywords !== `${translationKey}.KEYWORDS` ? keywords : undefined,
      path,
      imageAlt: imageAlt !== `${translationKey}.OG_IMAGE_ALT` ? imageAlt : undefined,
      robots: options?.robots,
    });
  }

  updateForRoute(routerUrl: string): void {
    const [path] = routerUrl.split('?');
    const query = routerUrl.includes('?') ? routerUrl.split('?')[1] : '';
    const params = new URLSearchParams(query);
    const normalizedPath = path || '/';

    const privatePrefixes = [
      '/dashboard',
      '/teams',
      '/employees',
      '/shifts',
      '/rules',
      '/schedules',
      '/leaves',
      '/feedback',
    ];

    if (privatePrefixes.some((prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`))) {
      this.updateFromKey('SEO.APP', normalizedPath, { robots: 'noindex, nofollow' });
      this.setStructuredData(null);
      return;
    }

    switch (normalizedPath) {
      case '/':
        this.updateFromKey('SEO.HOME', '/');
        break;
      case '/login':
        this.updateFromKey(params.get('mode') === 'register' ? 'SEO.REGISTER' : 'SEO.LOGIN', '/login');
        this.setStructuredData(null);
        break;
      case '/terms':
        this.updateFromKey('SEO.TERMS', '/terms');
        this.setStructuredData(null);
        break;
      case '/privacy':
        this.updateFromKey('SEO.PRIVACY', '/privacy');
        this.setStructuredData(null);
        break;
      case '/cookies':
        this.updateFromKey('SEO.COOKIES', '/cookies');
        this.setStructuredData(null);
        break;
      default:
        this.updateFromKey('SEO.HOME', normalizedPath);
        break;
    }
  }

  setPage(config: SeoPageConfig): void {
    const lang = this.translate.currentLang || SITE_CONFIG.defaultLocale;
    const path = config.path ?? '/';
    const canonicalPath = path === '/' ? '/' : path;
    const pageUrl = `${SITE_CONFIG.url}${canonicalPath === '/' ? '' : canonicalPath}`;
    const imagePath = config.imagePath ?? SITE_CONFIG.ogImagePath;
    const imageUrl = `${SITE_CONFIG.url}${imagePath}`;
    const robots = config.robots ?? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    const ogType = config.type ?? 'website';

    this.setHtmlLang(lang);
    this.title.setTitle(config.title);

    this.setMetaTag('name', 'description', config.description);
    this.setMetaTag('name', 'robots', robots);
    this.setMetaTag('name', 'author', SITE_CONFIG.author);
    this.setMetaTag('name', 'application-name', SITE_CONFIG.name);

    if (config.keywords) {
      this.setMetaTag('name', 'keywords', config.keywords);
    } else {
      this.meta.removeTag('name="keywords"');
    }

    this.setMetaTag('property', 'og:title', config.title);
    this.setMetaTag('property', 'og:description', config.description);
    this.setMetaTag('property', 'og:type', ogType);
    this.setMetaTag('property', 'og:url', pageUrl);
    this.setMetaTag('property', 'og:site_name', SITE_CONFIG.name);
    this.setMetaTag('property', 'og:locale', lang === 'bg' ? 'bg_BG' : 'en_US');
    this.setMetaTag('property', 'og:locale:alternate', lang === 'bg' ? 'en_US' : 'bg_BG');
    this.setMetaTag('property', 'og:image', imageUrl);
    this.setMetaTag('property', 'og:image:alt', config.imageAlt ?? SITE_CONFIG.name);

    this.setMetaTag('name', 'twitter:card', 'summary_large_image');
    this.setMetaTag('name', 'twitter:title', config.title);
    this.setMetaTag('name', 'twitter:description', config.description);
    this.setMetaTag('name', 'twitter:image', imageUrl);
    this.setMetaTag('name', 'twitter:image:alt', config.imageAlt ?? SITE_CONFIG.name);

    this.setLinkTag('canonical', pageUrl);
    this.setHreflang(path);
  }

  setHtmlLang(lang: string): void {
    if (this.document.documentElement) {
      this.document.documentElement.lang = lang;
    }
  }

  setStructuredData(data: Record<string, unknown> | Record<string, unknown>[] | null): void {
    const existing = this.document.getElementById(this.jsonLdScriptId);
    existing?.remove();

    if (!data) {
      return;
    }

    const script = this.document.createElement('script');
    script.id = this.jsonLdScriptId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  buildLandingStructuredData(): Record<string, unknown> {
    const lang = this.translate.currentLang || SITE_CONFIG.defaultLocale;
    const pageUrl = SITE_CONFIG.url;
    const imageUrl = `${SITE_CONFIG.url}${SITE_CONFIG.ogImagePath}`;
    const description = this.translate.instant('SEO.HOME.DESCRIPTION');
    const imageAlt = this.translate.instant('SEO.HOME.OG_IMAGE_ALT');

    const faqPairs = [
      ['LANDING.FAQ.Q1', 'LANDING.FAQ.A1'],
      ['LANDING.FAQ.Q2', 'LANDING.FAQ.A2'],
      ['LANDING.FAQ.Q3', 'LANDING.FAQ.A3'],
      ['LANDING.FAQ.Q4', 'LANDING.FAQ.A4'],
      ['LANDING.FAQ.Q5', 'LANDING.FAQ.A5'],
      ['LANDING.FAQ.Q6', 'LANDING.FAQ.A6'],
      ['LANDING.FAQ.Q7', 'LANDING.FAQ.A7'],
      ['LANDING.FAQ.Q8', 'LANDING.FAQ.A8'],
    ];

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${pageUrl}/#organization`,
          name: SITE_CONFIG.name,
          url: pageUrl,
          logo: `${pageUrl}/assets/images/logo.svg`,
          email: SITE_CONFIG.contactEmail,
          description,
        },
        {
          '@type': 'WebSite',
          '@id': `${pageUrl}/#website`,
          url: pageUrl,
          name: SITE_CONFIG.name,
          description,
          inLanguage: [lang, lang === 'en' ? 'bg' : 'en'],
          publisher: { '@id': `${pageUrl}/#organization` },
        },
        {
          '@type': 'SoftwareApplication',
          '@id': `${pageUrl}/#software`,
          name: SITE_CONFIG.name,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          url: pageUrl,
          image: imageUrl,
          description,
          offers: {
            '@type': 'AggregateOffer',
            lowPrice: '0',
            highPrice: '199',
            priceCurrency: 'USD',
            offerCount: '3',
          },
          featureList: [
            this.translate.instant('LANDING.FEATURES.ITEMS.RULE_BASED.TITLE'),
            this.translate.instant('LANDING.FEATURES.ITEMS.LEAVE.TITLE'),
            this.translate.instant('LANDING.FEATURES.ITEMS.ONE_CLICK.TITLE'),
          ],
        },
        {
          '@type': 'FAQPage',
          '@id': `${pageUrl}/#faq`,
          mainEntity: faqPairs.map(([questionKey, answerKey]) => ({
            '@type': 'Question',
            name: this.translate.instant(questionKey),
            acceptedAnswer: {
              '@type': 'Answer',
              text: this.translate.instant(answerKey),
            },
          })),
        },
      ],
    };
  }

  private setHreflang(path: string): void {
    const normalizedPath = path === '/' ? '' : path;

    SITE_CONFIG.locales.forEach((locale) => {
      const href = `${SITE_CONFIG.url}${normalizedPath}?lang=${locale}`;
      this.setLinkTag('alternate', href, locale);
    });

    this.setLinkTag('alternate', `${SITE_CONFIG.url}${normalizedPath}?lang=${SITE_CONFIG.defaultLocale}`, 'x-default');
  }

  private setMetaTag(attrSelector: 'name' | 'property', selector: string, content: string): void {
    if (!content) {
      return;
    }

    const key = `${attrSelector}="${selector}"`;
    if (this.meta.getTag(key)) {
      this.meta.updateTag({ [attrSelector]: selector, content });
      return;
    }

    this.meta.addTag({ [attrSelector]: selector, content });
  }

  private setLinkTag(rel: string, href: string, hreflang?: string): void {
    const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
    let link = this.document.head.querySelector(selector) as HTMLLinkElement | null;

    if (!link) {
      link = this.document.createElement('link');
      link.rel = rel;
      if (hreflang) {
        link.hreflang = hreflang;
      }
      this.document.head.appendChild(link);
    }

    link.href = href;
  }

  syncLangQueryParam(lang: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url.toString());
  }

  readLangFromUrl(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const lang = new URL(window.location.href).searchParams.get('lang');
    return lang && SITE_CONFIG.locales.includes(lang as (typeof SITE_CONFIG.locales)[number]) ? lang : null;
  }
}
