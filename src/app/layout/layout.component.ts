import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { ApiService } from '../services/api.service';
import { ToastComponent } from '../components/toast/toast.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, NgIf, RouterLink, RouterLinkActive, RouterOutlet, ToastComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  constructor(public router: Router, private api: ApiService) {}

  isAuthRoute() {
    return this.router.url.startsWith('/login');
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
}
