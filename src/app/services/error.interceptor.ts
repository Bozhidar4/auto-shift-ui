import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from './toast.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private toast: ToastService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Allow callers to skip global toast handling by sending header 'x-skip-toast'
    if (req.headers.get('x-skip-toast')) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        console.debug('[ErrorInterceptor] caught error', err);

        const extract = (payload: any): string => {
          if (!payload) return '';
          if (typeof payload === 'string') return payload;
          if (payload.error && typeof payload.error === 'string') return payload.error;
          if (payload.message && typeof payload.message === 'string') return payload.message;
          if (payload.title && typeof payload.title === 'string') return payload.title;
          if (Array.isArray(payload)) return payload.map((p:any) => p.description || p || JSON.stringify(p)).join('; ');
          if (payload.errors) {
            if (Array.isArray(payload.errors)) return payload.errors.map((p:any) => p.description || p).join('; ');
            if (typeof payload.errors === 'object') return Object.values(payload.errors).flat().map((p:any) => (p.description || p || String(p))).join('; ');
          }
          if (typeof payload === 'object') {
            const parts: string[] = [];
            for (const k of Object.keys(payload)) {
              const v = (payload as any)[k];
              if (Array.isArray(v)) parts.push(...v.map((it:any) => (typeof it === 'string' ? it : JSON.stringify(it))));
            }
            if (parts.length) return parts.join('; ');
          }

          return 'Something went wrong';
        };

        let msg = 'An error occurred';
        if (err.error) {
          const parsed = extract(err.error);
          if (parsed) msg = parsed;
        } else if (err.message) msg = err.message;

        console.debug('[ErrorInterceptor] emitting toast message:', msg);
        this.toast.show(msg, 'error', 7000);
        return throwError(() => err);
      })
    );
  }
}
