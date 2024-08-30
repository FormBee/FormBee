import { Component } from '@angular/core';
import { DashboardNavComponent } from '../dashboard-nav/dashboard-nav.component';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { StripeCardElementComponent } from '../stripe-card-element/stripe-card-element.component';
@Component({
  selector: 'app-upgrade-to-growth',
  standalone: true,
  imports: [
    DashboardNavComponent,
    StripeCardElementComponent,
  ],
  templateUrl: './upgrade-to-growth.component.html',
  styleUrl: './upgrade-to-growth.component.scss'
})
export class UpgradeToGrowthComponent implements OnInit {
  name: string | undefined;
  login: string | undefined;
  profilePic: string = "../assets/FormBee-logo2.png";
  githubId: string | undefined;
  loading: boolean = true;
  fetchUrl: string = "http://localhost:3000/";
  constructor(private Router: Router) {
    }
    ngOnInit(): void {
      // Get the theme
      console.log(this.githubId);
      const theme = localStorage.getItem("theme");
      if (theme) {
        document.documentElement.className = theme;
      }
      const token = localStorage.getItem('Fb-pA4lBUfsqVAWFN78eWDF');
      if (!token) {
        this.Router.navigate(['/login']);
        return;
      } else {
        console.log("Token found");
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
          }).then(() => {
            fetch(this.fetchUrl + 'api/user/' + this.githubId).then(response => response.json()).then(data => {
              console.log("fetched user data");
            });
          }).then(() => {
            fetch('http://localhost:3000/get-default-payment-method/' + this.githubId, { method: 'GET' }).then(response => response.json()).then(data => {
              if (data.paymentMethod) {
                console.log("payment method found: ", data.paymentMethod);
              }
            })})
          .finally(() => {
            setTimeout(() => {
              this.loading = false;
            }, 1000);
          });
      }
    }
  }