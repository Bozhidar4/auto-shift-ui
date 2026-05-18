import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../../components/language-switcher/language-switcher.component';
import { FormsModule } from '@angular/forms';
import { EmailService } from '../../services/email.service';
import { ToastService } from '../../services/toast.service';
import { ContactMessage } from '../../models/contact-message.interface';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule, TranslateModule, LanguageSwitcherComponent, FormsModule],
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
    isScrolled = false;
    isMenuOpen = false;
    openFaqIndex: number | null = null;

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
        private toast: ToastService
    ) { }

    ngOnInit(): void {
        // Initial scroll check
        this.isScrolled = window.scrollY > 50;
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
            await this.emailService.send(this.contactForm);
            this.toast.show(this.translate.instant('CONTACT.SUCCESS'), 'success');
            this.resetForm();
        } catch (error) {
            this.toast.show(this.translate.instant('CONTACT.ERROR'), 'error');
        } finally {
            this.isSending = false;
        }
    }

    private resetForm(): void {
        this.contactForm = {
            name: '',
            email: '',
            type: 'GENERAL',
            message: '',
            rating: 0,
            page: 'Landing'
        };
    }
}
