import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { DashboardNavComponent } from '../dashboard-nav/dashboard-nav.component';
import { DashboardUserInfoComponent } from '../dashboard-user-info/dashboard-user-info.component';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ NgIf, 
    DashboardNavComponent,
    DashboardUserInfoComponent,
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
  constructor(private Router: Router) {}

  ngOnInit(): void {
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
        this.loading = false;
      });
  }
}