import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { DashboardNavComponent } from '../dashboard-nav/dashboard-nav.component';
import { DashboardUserInfoComponent } from '../dashboard-user-info/dashboard-user-info.component';
import { NgFor } from '@angular/common';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ NgIf, 
    DashboardNavComponent,
    DashboardUserInfoComponent,
    NgFor,
   ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  name: string | undefined;
  login: string | undefined;
  profilePic: string | undefined;
  githubId: string | undefined;
  loading: boolean = true;
  hexagons = Array(7).fill(0); // Creates an array with 7 hexagon
  currentTheme: string = localStorage.getItem("theme") || "neutral";
  constructor(private Router: Router) {}

  ngOnInit(): void {
    this.currentTheme = localStorage.getItem("theme") || "neutral";
    document.documentElement.className = this.currentTheme;
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