import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [],
  templateUrl: './landing-footer.component.html',
  styleUrl: './landing-footer.component.scss'
})
export class LandingFooterComponent {

  constructor(private router: Router) {}
  openTerms() {
    this.router.navigate(['/terms-of-service']);
    window.scrollTo(0, 0);
  }
  openPrivacy() {
    this.router.navigate(['/privacy-policy']);
    window.scrollTo(0, 0);
  }
  openCookies() {
    this.router.navigate(['/cookies-policy']);
  }
  goToDocs() {
    window.open("https://docs.formbee.dev/docs");
  }
  openContact() {
    this.router.navigate(['/contact']);
    window.scrollTo(0, 0);
  }
}
