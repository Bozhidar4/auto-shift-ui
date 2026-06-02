import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { ConfirmState } from '../../models/confirm-state.interface';

@Component({
    selector: 'app-billing',
    standalone: true,
    imports: [CommonModule, MatIconModule, TranslateModule, ConfirmComponent],
    templateUrl: './billing.component.html',
    styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {
    prices: any[] = [];
    isLoading = true;
    loadingCheckoutPriceId: string | null = null;
    currentPlanId: string | null = null;

    billingProfile: any = null;
    subscription: any = null;
    isBillingLoading = true;
    isPortalRedirecting = false;
    isCancelling = false;
    isChangingPlan = false;
    confirmState: ConfirmState = { visible: false, title: '', message: '', target: null };

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
    ) { }

    ngOnInit(): void {
        this.loadPrices();
        this.loadSubscription();
    }

    loadSubscription(): void {
        this.isBillingLoading = true;
        this.apiService.getBillingProfile().subscribe({
            next: (res: any) => {
                this.billingProfile = res;
                this.subscription = res?.subscription || res?.Subscription || null;
                this.currentPlanId = res?.stripePriceId || res?.StripePriceId || null;
                this.isBillingLoading = false;
            },
            error: (err) => {
                if (err?.status === 404) {
                    console.log('No billing profile found (expected for free tier).');
                } else {
                    console.error('Failed to load subscription details:', err);
                }
                this.billingProfile = null;
                this.subscription = null;
                this.currentPlanId = null;
                this.isBillingLoading = false;
            }
        });
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

        this.loadingCheckoutPriceId = priceId;
        this.apiService.createCheckoutSession(priceId).subscribe({
            next: (res) => {
                if (res && res.url) {
                    window.location.href = res.url;
                } else {
                    this.loadingCheckoutPriceId = null;
                    this.toast.show('Checkout URL not found', 'error');
                }
            },
            error: (err) => {
                console.error(err);
                this.loadingCheckoutPriceId = null;
                this.toast.show(err?.error?.error || 'Failed to start checkout', 'error');
            }
        });
    }

    manageBilling(): void {
        this.isPortalRedirecting = true;
        const returnUrl = window.location.href;
        this.apiService.createBillingPortalSession(returnUrl).subscribe({
            next: (res) => {
                if (res && res.url) {
                    window.location.href = res.url;
                } else {
                    this.isPortalRedirecting = false;
                    this.toast.show(this.translate.instant('BILLING_PAGE.PORTAL_ERROR'), 'error');
                }
            },
            error: (err) => {
                console.error('Failed to create billing portal session:', err);
                this.isPortalRedirecting = false;
                this.toast.show(err?.error?.error || this.translate.instant('BILLING_PAGE.PORTAL_ERROR'), 'error');
            }
        });
    }

    confirmCancelSubscription(): void {
        this.confirmState = {
            visible: true,
            title: this.translate.instant('BILLING_PAGE.CANCEL_CONFIRM_TITLE'),
            message: this.translate.instant('BILLING_PAGE.CANCEL_CONFIRM_MSG'),
            target: 'cancel_subscription'
        };
    }

    confirmChangePlan(priceId: string, planNameKey: string): void {
        const planName = this.translate.instant(planNameKey);
        this.confirmState = {
            visible: true,
            title: this.translate.instant('BILLING_PAGE.CHANGE_PLAN_CONFIRM_TITLE'),
            message: this.translate.instant('BILLING_PAGE.CHANGE_PLAN_CONFIRM_MSG', { planName }),
            target: { priceId }
        };
    }

    onConfirmedAction(): void {
        const target = this.confirmState.target;
        if (target === 'cancel_subscription') {
            this.executeCancel();
        } else if (target && typeof target === 'object' && target.priceId) {
            this.executeChangePlan(target.priceId);
        }
        this.confirmState.visible = false;
        this.confirmState.target = null;
    }

    onCancelledAction(): void {
        this.confirmState.visible = false;
        this.confirmState.target = null;
    }

    private executeCancel(): void {
        this.isCancelling = true;
        this.apiService.cancelSubscription(true).subscribe({
            next: (res) => {
                this.isCancelling = false;
                this.toast.show(this.translate.instant('BILLING_PAGE.CANCEL_SUCCESS'), 'success');
                this.loadSubscription();
            },
            error: (err) => {
                console.error('Failed to cancel subscription:', err);
                this.isCancelling = false;
                this.toast.show(err?.error?.error || this.translate.instant('BILLING_PAGE.CANCEL_ERROR'), 'error');
            }
        });
    }

    private executeChangePlan(priceId: string): void {
        this.isChangingPlan = true;
        this.apiService.changePlan(priceId).subscribe({
            next: (res) => {
                this.isChangingPlan = false;
                this.toast.show(this.translate.instant('BILLING_PAGE.CHANGE_PLAN_SUCCESS'), 'success');
                this.loadSubscription();
            },
            error: (err) => {
                console.error('Failed to change plan:', err);
                this.isChangingPlan = false;
                this.toast.show(err?.error?.error || this.translate.instant('BILLING_PAGE.CHANGE_PLAN_ERROR'), 'error');
            }
        });
    }

    getActivePlanName(): string {
        if (!this.currentPlanId) {
            return 'BILLING_PAGE.FREE_PLAN_ACTIVE';
        }
        if (this.currentPlanId === this.starterPlan.priceId) {
            return this.starterPlan.name;
        }
        if (this.currentPlanId === this.growthPlan.priceId) {
            return this.growthPlan.name;
        }
        return 'BILLING_PAGE.STATUS_UNKNOWN';
    }

    getActivePlanCost(): string {
        if (!this.currentPlanId) {
            return 'LANDING.PRICING.FREE.PRICE';
        }
        if (this.currentPlanId === this.starterPlan.priceId) {
            return this.starterPlan.priceKey;
        }
        if (this.currentPlanId === this.growthPlan.priceId) {
            return this.growthPlan.priceKey;
        }
        return '';
    }

    getRenewalDate(): string {
        const sub = this.subscription;
        if (!sub) return '';

        const dateValue: any = sub.currentPeriodEnd;
        if (!dateValue) return '';

        const date = typeof dateValue === 'number'
            ? new Date(dateValue * 1000)
            : new Date(dateValue);

        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }

    isPendingCancellation(): boolean {
        const sub = this.subscription;
        if (!sub) return false;
        return !!(sub.cancelAtPeriodEnd || sub.cancel_at_period_end || sub.CancelAtPeriodEnd);
    }
}
