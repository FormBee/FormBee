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
  apiKey: string | undefined;
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
          this.name = data.name;
          this.login = data.login;
          this.profilePic = data.avatar_url;
          this.githubId = data.id;
        }
      })
      .then(() => {
        fetch('http://localhost:3000/api/user/' + this.githubId)
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            if (!data.apiKey) {
              console.log("No API key found");
              fetch('http://localhost:3000/create-api-key/' + this.githubId, {
                method: 'POST',
              })
                .then((response) => response.json())
                .then((data) => {
                  console.log(data);
                  this.apiKey = data.apiKey;
                });
            } else {
              console.log("API key found");
            }
            this.apiKey = data.apiKey;
            console.log(this.apiKey);
          });
      })
      .finally(() => {
        this.loading = false;
      });
  }
}