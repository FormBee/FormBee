import { Component } from '@angular/core';
import { LandingThreeBgComponent } from '../landing-three-bg/landing-three-bg.component';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LandingThreeBgComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  constructor(private router: Router, route: ActivatedRoute,) {
  }
  landingPage() {
    this.router.navigate(['/home']);
  }

  login() {
    // Redirect to GitHub OAuth login
    window.location.href = 'http://localhost:3000/auth/github';

  }
}