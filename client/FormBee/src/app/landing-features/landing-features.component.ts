import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-landing-features',
  standalone: true,
  imports: [],
  templateUrl: './landing-features.component.html',
  styleUrl: './landing-features.component.scss'
})
export class LandingFeaturesComponent {
  constructor(private router: Router) {}
  goToPrivacyPolicy() {
    this.router.navigate(['/privacy-policy']);
    window.scrollTo(0, 0);
  }
  goToGithub() {
    window.open("https://github.com/FormBee");
  }
  goToDocs() {
    window.open("https://docs.formbee.dev/docs");
  }
  goToDocsCaptcha() {
    window.open("https://docs.formbee.dev/docs/features/captchas/pow-captcha");
  }
}
