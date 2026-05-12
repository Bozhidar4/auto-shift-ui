import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../../components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, LanguageSwitcherComponent],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  mode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  error = '';

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap.get('mode');
    if (qp === 'register' || qp === 'login') {
      this.mode = qp as 'login' | 'register';
    }
  }

  toggleMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.error = '';
  }

  submit() {
    this.error = '';
    if (this.mode === 'login') {
      this.api.login(this.email, this.password).subscribe({
        next: (res) => {
          // backend returns { token }
          const token = res?.token;
          if (token) {
            localStorage.setItem('access_token', token);
          }

          this.router.navigate(['/dashboard']);
        },
        error: (e) => {
          // Try a flexible login with alternate payload shapes (diagnostic fallback)
          this.api.loginFlexible(this.email, this.password).subscribe({
            next: (res2) => {
              const token = res2?.token;
              if (token) {
                localStorage.setItem('access_token', token);
              }

              this.router.navigate(['/dashboard']);
            },
            error: (e2) => {
              this.error = this.translate.instant('AUTH.ERROR_LOGIN') || 'Login failed';
            }
          });
        }
      });
    } else {
      this.api.register(this.email, this.password).subscribe({
        next: (res) => {
          const token = res?.token;
          if (token) {
            localStorage.setItem('access_token', token);
          }

          this.router.navigate(['/dashboard']);
        },
        error: (e) => {
          const payload = e?.error;
          if (payload && Array.isArray(payload)) {
            this.error = payload.map((it: any) => it.description || it).join('; ');
            return;
          }
          this.error = this.translate.instant('AUTH.ERROR_REGISTER') || 'Registration failed';
        }
      });
    }
  }
}
