import { Component } from '@angular/core';
import { LandingThreeBgComponent } from '../landing-three-bg/landing-three-bg.component';
import { Router, } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LandingThreeBgComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  constructor(private router: Router) {}

  // Linked to the Formbee Logo with (click) to send the user back to the home page
  landingPage() {
    this.router.navigate(['/home']);
  }
}
