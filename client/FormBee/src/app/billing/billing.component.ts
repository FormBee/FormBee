import { Component } from '@angular/core';
import { DashboardNavComponent } from '../dashboard-nav/dashboard-nav.component';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { NgForOf, NgStyle } from '@angular/common';
import { BillingPlansComponent } from '../billing-plans/billing-plans.component';
import { StripeCardElementComponent } from '../stripe-card-element/stripe-card-element.component';
import { CardStateService } from '../card-state.service';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [
    DashboardNavComponent,
    NgIf,
    NgForOf,
    NgStyle,
    BillingPlansComponent,
    StripeCardElementComponent,
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
  subscriptionTier: string = "Loading...";
  maxSubs: number = 0;
  currentSubs: number = 0;
  maxPlugins: number | string = 0;
  currentTheme: string = localStorage.getItem("theme") || "neutral";
  hexagons: Array<{ style: { [key: string]: string } }> = [];
  last4Digits: string = "";
  billingEmail: string | undefined;
  invalidEmail: string | undefined;
  successMessage: string | undefined;
  resetDate: string | undefined;
  // fetchUrl: string = "https://pleasing-love-production.up.railway.app/";
  // fetchUrl: string = "http://localhost:3000/";
  fetchUrl: string = "https://api.formbee.dev/";
  constructor(private Router: Router, public cardStateService: CardStateService) {
    const navigator = this.Router.getCurrentNavigation();
    if (navigator?.extras.state) {
      this.githubId = navigator.extras.state['githubId'];
    }
  }
  ngOnInit(): void {
    this.createHexagons(6); // Create 20 hexagons
    document.documentElement.className = this.currentTheme;
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
      }).then(() => {
        fetch(this.fetchUrl + 'api/user/' + this.githubId).then(response => response.json()).then(data => {
            this.maxPlugins = data.maxPlugins;
            this.maxSubs = data.maxSubmissions;
            this.subscriptionTier = data.subscriptionTier;
            this.billingEmail = data.billingEmail;
            this.resetDate = data.apiResetDate.split("T")[0];
            if (this.maxPlugins === null) {
              this.maxPlugins = "Unlimited";
            }
        });
      }).then(() => {
        fetch('https://api.formbee.dev/get-default-payment-method/' + this.githubId, { method: 'GET' }).then(response => response.json()).then(data => {
          if (data.paymentMethod) {
            this.cardStateService.cardState = false;
            this.last4Digits = data.paymentMethod.card.last4;
          }
        })})
      .finally(() => {
        setTimeout(() => {
          this.loading = false;
        }, 1000);
      });
  }

  editPaymentMethod () {
    this.cardStateService.cardState = true;
  }

  updateBillingEmail() {
    const emailElement = document.getElementById('billingEmail') as HTMLInputElement;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailElement) {
      const email = emailElement.value;
      if (!emailRegex.test(email)) {
        this.invalidEmail = 'Please enter a valid email';
        setTimeout(() => {
          this.invalidEmail = undefined;
        }, 5000);
        return;
      }
      if (email && emailRegex.test(email)) {
        fetch('https://api.formbee.dev/update-billing-email/' + this.githubId, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
          }),
        }).then(response => response.json()).then(data => {
          this.successMessage = data.message;
          setTimeout(() => {
            this.successMessage = undefined;
          }, 5000);
        });
      } else {
        this.invalidEmail = 'Please enter a valid email';
        setTimeout(() => {
          this.invalidEmail = undefined;
        }, 5000);
      }
    }
  }


  createHexagons(count: number) {
    for (let i = 0; i < count; i++) {
      const size = this.random(25, 100); // Random size between 50 and 150px
      const positionX = this.random(0, 100); // Random position between 0% and 100%
      const positionY = this.random(0, 100); // Random position between 0% and 100%
      const animationDuration = this.random(5, 15); // Random duration between 5s and 15s

      this.hexagons.push({
        style: {
          width: `${size}px`,
          height: `${size * 1.15}px`, // Adjust height for hexagon shape
          top: `${positionY}%`,
          left: `${positionX}%`,
          animationDuration: `${animationDuration}s`,
        }
      });
    }
  }
  managePlan() {
  fetch('https://api.formbee.dev/manage-plan/' + this.githubId,{
    method: 'POST',
  }).then(response => response.json()).then(data => {
    window.location.href = data.url;
  })
  }

  viewPlans = () => {
    let BillingSection = document.getElementById('BillingComponent');
    if (BillingSection) {
      BillingSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }
  random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}