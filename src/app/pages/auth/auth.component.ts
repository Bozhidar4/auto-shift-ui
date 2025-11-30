import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  mode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  displayName = '';
  error = '';

  constructor(private api: ApiService, private router: Router) {}

  toggleMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.error = '';
  }

  submit() {
    this.error = '';
    if (this.mode === 'login') {
      this.api.login(this.email, this.password).subscribe({
        next: (res: any) => {
          // backend returns { token }
          const token = res?.token;
          if (token) localStorage.setItem('access_token', token);
          this.router.navigate(['/dashboard']);
        },
        error: (e) => {
          // Try a flexible login with alternate payload shapes (diagnostic fallback)
          this.api.loginFlexible(this.email, this.password).subscribe({
            next: (res2:any) => {
              const token = res2?.token;
              if (token) localStorage.setItem('access_token', token);
              this.router.navigate(['/dashboard']);
            },
            error: (e2) => {
              this.error = e2?.error?.message || e2?.statusText || 'Login failed';
            }
          });
        }
      });
    } else {
      this.api.register(this.email, this.password, this.displayName).subscribe({
        next: (res:any) => {
          const token = res?.token;
          if (token) localStorage.setItem('access_token', token);
          this.router.navigate(['/dashboard']);
        },
        error: (e) => {
          const payload = e?.error;
          if (payload && Array.isArray(payload)) {
            this.error = payload.map((it: any) => it.description || it).join('; ');
            return;
          }
          this.error = payload?.message || e?.statusText || 'Registration failed';
        }
      });
    }
  }
}
