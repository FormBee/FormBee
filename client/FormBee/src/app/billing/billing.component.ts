import { Component } from '@angular/core';
import { DashboardNavComponent } from '../dashboard-nav/dashboard-nav.component';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { NgForOf, NgStyle } from '@angular/common';
import { BillingPlansComponent } from '../billing-plans/billing-plans.component';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [
    DashboardNavComponent,
    NgIf,
    NgForOf,
    NgStyle,
    BillingPlansComponent,
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
  maxPlugins: number = 0;
  currentTheme: string = localStorage.getItem("theme") || "neutral";
  hexagons: Array<{ style: { [key: string]: string } }> = [];
  // fetchUrl: string = "https://pleasing-love-production.up.railway.app/";
  fetchUrl: string = "http://localhost:3000/";
  constructor(private Router: Router) {
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
          if (data.maxPlugins) {
            this.maxPlugins = data.maxPlugins;
            this.maxSubs = data.maxSubmissions;
            this.subscriptionTier = data.subscriptionTier;
          }
        });
      })
      .finally(() => {
        setTimeout(() => {
          this.loading = false;
        }, 1000);
      });
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