import { Component } from '@angular/core';
import { LandingThreeBgComponent } from '../landing-three-bg/landing-three-bg.component';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LandingThreeBgComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent  implements OnInit {
  name: string | undefined;
  email: string | undefined;
  constructor(private router: Router, route: ActivatedRoute,) {
  }
  landingPage() {
    this.router.navigate(['/home']);
  }
  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
      fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log(data);
          this.name = data.name;
          this.email = data.email;
        });
        if (token) {
          localStorage.setItem('Fb-pA4lBUfsqVAWFN78eWDF', token);
          this.router.navigate(['/dashboard']);
        }
  }

  login() {
    // window.location.href = 'https://pleasing-love-production.up.railway.app/auth/github';
    window.location.href = 'http://localhost:3000/auth/github';
  }

  termsOfService() {
    this.router.navigate(['/terms-of-service']);
  }
}