import { Injectable } from '@angular/core';
import { CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivateChild {
    constructor(private router: Router) { }

    canActivateChild(
        childRoute: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean | UrlTree | Observable<boolean | UrlTree> {
        const token = localStorage.getItem('access_token');
        if (token) {
            return true;
        }

        return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }
}
