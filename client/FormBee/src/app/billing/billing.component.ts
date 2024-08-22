import { Component } from '@angular/core';
import { DashboardNavComponent } from '../dashboard-nav/dashboard-nav.component';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';
@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [
    DashboardNavComponent,
  ],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.scss'
})

export class BillingComponent implements OnInit {
  githubId: string | undefined;
  profilePic: string = "../assets/FormBee-logo2.png";
  name: string | undefined;
  login: string | undefined;
  loading: boolean = true;
  subscriptionTier: string = "Free";
  maxSubs: number = 1;
  currentSubs: number = 1;
  constructor(private Router: Router) {
    const navigator = this.Router.getCurrentNavigation();
    if (navigator?.extras.state) {
      this.githubId = navigator.extras.state['githubId'];
    }
  }
  ngOnInit(): void {
    console.log(this.githubId);
    const token = localStorage.getItem('Fb-pA4lBUfsqVAWFN78eWDF');
    if (!token) {
      this.Router.navigate(['/login']);
      return;
    }

    fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.status === 401) {
          this.Router.navigate(['/login']);
          return;
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          console.log("Data: ", data);
          if (data.name) {
            this.name = data.name;
          } else {
            this.name = data.login;
          }
          this.profilePic = data.avatar_url;
          this.githubId = data.id;
        }
      })
      .finally(() => {
        setTimeout(() => {
          this.loading = false;
        }, 1000);
      });
  }
}