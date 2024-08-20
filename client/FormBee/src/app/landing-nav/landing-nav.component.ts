import { Component, } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-landing-nav',
  standalone: true,
  imports: [],
  templateUrl: './landing-nav.component.html',
  styleUrl: './landing-nav.component.scss'
})
export class LandingNavComponent {
  menuOpen = false;
  constructor(private router: Router) {}
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  signIn() {
    this.router.navigate(['/login']);
  }
  pricingJump() {
    const pricingSection = document.getElementById('pricing-section');
    if (!pricingSection) {
      console.log("Pricing section not found");
      return;
    }
    pricingSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}

