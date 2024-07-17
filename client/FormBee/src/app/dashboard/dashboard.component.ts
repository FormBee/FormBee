import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { DashboardNavComponent } from '../dashboard-nav/dashboard-nav.component';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ NgIf, DashboardNavComponent ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  name: string | undefined;
  login: string | undefined;
  loading: boolean = true; // Add this line
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
          // console.log("Data: ", data);
          this.name = data.name;
          this.login = data.login;
        }
      })
      .catch((error) => {
      })
      .finally(() => {
        this.loading = false;
      });
  }
}