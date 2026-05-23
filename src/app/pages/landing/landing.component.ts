import { Component, OnDestroy, OnInit, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../../components/language-switcher/language-switcher.component';
import { FormsModule, NgForm } from '@angular/forms';
import { EmailService } from '../../services/email.service';
import { ToastService } from '../../services/toast.service';
import { ContactMessage } from '../../models/contact-message.interface';
import { SeoService } from '../../services/seo.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule, TranslateModule, LanguageSwitcherComponent, FormsModule],
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy {
    @ViewChild('contactFormRef') contactFormRef!: NgForm;
    isScrolled = false;
    isMenuOpen = false;
    openFaqIndex: number | null = null;
    private langSubscription?: Subscription;

    contactForm: ContactMessage = {
        name: '',
        email: '',
        type: 'GENERAL',
        message: '',
        rating: 0,
        page: 'Landing'
    };
    isSending = false;

    constructor(
        private translate: TranslateService,
        private emailService: EmailService,
        private toast: ToastService,
        private seo: SeoService
    ) { }

    ngOnInit(): void {
        this.isScrolled = window.scrollY > 50;
        this.refreshLandingSeo();

        this.langSubscription = this.translate.onLangChange.subscribe(() => {
            this.refreshLandingSeo();
        });
    }

    ngOnDestroy(): void {
        this.langSubscription?.unsubscribe();
    }

    private refreshLandingSeo(): void {
        this.seo.updateFromKey('SEO.HOME', '/');
        this.seo.setStructuredData(this.seo.buildLandingStructuredData());
    }

    scrollTo(
        sectionId: string,
        event: Event
    ): void {
        event.preventDefault();
        this.isMenuOpen = false;
        const element = document.getElementById(sectionId);

        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        this.isScrolled = window.scrollY > 50;
    }

    toggleFaq(index: number): void {
        this.openFaqIndex = this.openFaqIndex === index ? null : index;
    }

    setRating(rating: number): void {
        this.contactForm.rating = rating;
    }

    async submitContact(): Promise<void> {
        if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
            return;
        }

        this.isSending = true;

        try {
            const response = await this.emailService.send(this.contactForm);
            const msg = response?.message || this.translate.instant('CONTACT.SUCCESS');
            this.toast.show(msg, 'success');

            const defaultState = {
                name: '',
                email: '',
                type: 'GENERAL',
                message: '',
                rating: 0,
                page: 'Landing'
            };
            if (this.contactFormRef) {
                this.contactFormRef.resetForm(defaultState);
            }
            this.contactForm = defaultState;
        } catch (error) {
            this.toast.show(this.translate.instant('CONTACT.ERROR'), 'error');
        } finally {
            this.isSending = false;
        }
    }
}
