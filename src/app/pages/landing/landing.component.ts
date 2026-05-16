import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../../components/language-switcher/language-switcher.component';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule, TranslateModule, LanguageSwitcherComponent],
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
    isScrolled = false;
    isMenuOpen = false;
    openFaqIndex: number | null = null;

    constructor(private translate: TranslateService) { }

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
}
