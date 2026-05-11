import { Component, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { ToastComponent } from '../components/toast/toast.component';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ToastComponent, MatIconModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnDestroy {
  isLanding = false;
  isAuth = false;
  private sub: Subscription | null = null;

  constructor(
    public router: Router,
    private api: ApiService
  ) {
    this.sub = this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        const url = evt.urlAfterRedirects || this.router.url || '';
        this.isLanding = (url === '/' || url === '');
        this.isAuth = url.startsWith('/login');
      }
    });

    const initUrl = this.router.url || '';
    this.isLanding = (initUrl === '/' || initUrl === '');
    this.isAuth = initUrl.startsWith('/login');
  }

  logout() {
    this.api.logout().subscribe({
      next: () => {
        localStorage.removeItem('access_token');
        this.router.navigate(['/login']);
      },
      error: () => {
        // always clear local token and redirect even if API call fails
        localStorage.removeItem('access_token');
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
