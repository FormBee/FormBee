import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-landing-pricing',
  standalone: true,
  imports: [],
  templateUrl: './landing-pricing.component.html',
  styleUrl: './landing-pricing.component.scss'
})
export class LandingPricingComponent {
  constructor(private router: Router) {}
  openContact() {
    this.router.navigate(['/contact']);
    window.scrollTo(0, 0);
  }

  openLogin() {
    this.router.navigate(['/login']);
  }
  openBilling() {
    this.router.navigate(['/billing']);
  }
  goToDocsSelfHost() {
    window.open("https://docs.formbee.dev/docs/self%20hosting/Github");
  }
}
