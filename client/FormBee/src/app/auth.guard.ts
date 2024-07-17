import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const token = localStorage.getItem('Fb-pA4lBUfsqVAWFN78eWDF');
    console.log(token);

    return fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return true;
        } else if (response.status === 401) {
          // Redirect to home page on 401 error
          this.router.navigate(['/login']);
          return false;
        } else {
          // For other response statuses, you may want to add additional handling
          return false;
        }
      })
      .catch((error) => {
        // Handle any errors that occurred during the fetch
        console.error('Error during authentication:', error);
        this.router.navigate(['/login']);
        return false;
      });
  }
}