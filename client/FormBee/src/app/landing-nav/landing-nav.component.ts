import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-nav',
  standalone: true,
  imports: [],
  templateUrl: './landing-nav.component.html',
  styleUrls: ['./landing-nav.component.scss']
})
export class LandingNavComponent {
  menuOpen = false;

  constructor(private router: Router) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  goToDocs() {
    window.open("https://docs.formbee.dev/docs");
  }
  goHome() {
    this.router.navigate(['/home']);
  }

  signIn() {
    this.router.navigate(['/login']);
  }

  pricingJump() {
    this.menuOpen = false;
    const pricingSection = document.getElementById('pricing-section');
    if (!pricingSection) {
      this.router.navigate(['/home']);
      setTimeout(() => {
        let pricingSection = document.getElementById('pricing-section');
        if (pricingSection) {
          pricingSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 1000);
      return;
    }
    pricingSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}
