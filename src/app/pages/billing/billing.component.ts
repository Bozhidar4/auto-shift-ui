import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-billing',
    standalone: true,
    imports: [CommonModule, MatIconModule, TranslateModule],
    templateUrl: './billing.component.html',
    styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {
    prices: any[] = [];
    isLoading = true;
    isCheckingOut = false;
    currentPlanId: string | null = null; // Normally fetched from user profile

    freePlan = {
        name: 'LANDING.PRICING.FREE.NAME',
        desc: 'LANDING.PRICING.FREE.DESC',
        priceKey: 'LANDING.PRICING.FREE.PRICE',
        features: [
            'LANDING.PRICING.FREE.F1',
            'LANDING.PRICING.FREE.F2',
            'LANDING.PRICING.FREE.F3',
            'LANDING.PRICING.FREE.F4',
            'LANDING.PRICING.FREE.F5'
        ]
    };

    starterPlan = {
        name: 'LANDING.PRICING.STARTER.NAME',
        desc: 'LANDING.PRICING.STARTER.DESC',
        priceKey: 'LANDING.PRICING.STARTER.PRICE',
        features: [
            'LANDING.PRICING.STARTER.F1',
            'LANDING.PRICING.STARTER.F2',
            'LANDING.PRICING.STARTER.F3',
            'LANDING.PRICING.STARTER.F4',
            'LANDING.PRICING.STARTER.F5',
            'LANDING.PRICING.STARTER.F6'
        ],
        badge: 'LANDING.PRICING.STARTER.BADGE',
        priceId: ''
    };

    growthPlan = {
        name: 'LANDING.PRICING.GROWTH.NAME',
        desc: 'LANDING.PRICING.GROWTH.DESC',
        priceKey: 'LANDING.PRICING.GROWTH.PRICE',
        features: [
            'LANDING.PRICING.GROWTH.F1',
            'LANDING.PRICING.GROWTH.F2',
            'LANDING.PRICING.GROWTH.F3',
            'LANDING.PRICING.GROWTH.F4'
        ],
        priceId: ''
    };

    constructor(
        private apiService: ApiService,
        private toast: ToastService,
        private translate: TranslateService
    ) {}

    ngOnInit(): void {
        this.loadPrices();
    }

    loadPrices(): void {
        this.isLoading = true;
        this.apiService.getStripePrices().subscribe({
            next: (res: any[]) => {
                this.prices = res;
                this.mapPrices();
                this.isLoading = false;
            },
            error: (err) => {
                console.error(err);
                this.toast.show(this.translate.instant('CONTACT.ERROR'), 'error');
                this.isLoading = false;
            }
        });
    }

    mapPrices(): void {
        if (!this.prices || this.prices.length === 0) return;

        // Try to match prices to plans based on amounts or product names
        // Assuming we sort by amount to determine starter vs growth
        const sortedPrices = [...this.prices].sort((a, b) => (a.amount || 0) - (b.amount || 0));

        if (sortedPrices.length > 0) {
            const starter = sortedPrices[0];
            this.starterPlan.priceId = starter.id;
            this.starterPlan.priceKey = this.formatPrice(starter.amount, starter.currency);

            if (sortedPrices.length > 1) {
                const growth = sortedPrices[1];
                this.growthPlan.priceId = growth.id;
                this.growthPlan.priceKey = this.formatPrice(growth.amount, growth.currency);
            }
        }
    }

    formatPrice(amount: number, currency: string): string {
        const value = (amount || 0);
        // Stripe usually returns amounts in cents, but the backend does Amount = p.UnitAmountDecimal ?? p.UnitAmount.
        // It might be cents if UnitAmountDecimal isn't used properly or depending on currency, but we'll assume it's cents if it's > 1000 for standard plans, or maybe it's already decimal. 
        // Let's assume the backend provides it in cents for USD standard.
        // Wait, stripe .NET SDK `UnitAmount` is in cents.
        const decimalValue = value / 100;
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
            minimumFractionDigits: 0
        }).format(decimalValue);
    }

    upgrade(priceId: string): void {
        if (!priceId) {
            this.toast.show('Price ID not found', 'error');
            return;
        }

        this.isCheckingOut = true;
        this.apiService.createCheckoutSession(priceId).subscribe({
            next: (res) => {
                if (res && res.url) {
                    window.location.href = res.url;
                } else {
                    this.isCheckingOut = false;
                    this.toast.show('Checkout URL not found', 'error');
                }
            },
            error: (err) => {
                console.error(err);
                this.isCheckingOut = false;
                this.toast.show(err?.error?.error || 'Failed to start checkout', 'error');
            }
        });
    }
}
