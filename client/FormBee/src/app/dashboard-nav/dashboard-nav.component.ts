import { Component, Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { max } from 'rxjs';
import { fetchUrl } from '../global-vars';
@Component({
  selector: 'app-dashboard-nav',
  standalone: true,
  imports: [NgFor],
  templateUrl: './dashboard-nav.component.html',
  styleUrl: './dashboard-nav.component.scss'
})
export class DashboardNavComponent implements OnInit {
  @Input() name: string | undefined;
  @Input() login: string | undefined;
  @Input() profilePic: string | undefined;
  @Input() githubId: string | undefined;
  currentSubs: number = 0;
  maxSubs: number = 0;
  subscriptionTier: string = "Loading...";
  isDropdownOpen: boolean = false;
  themes: string[] = ['dark', 'neutral', 'light-theme'];
  currentTheme: string = 'neutral';
  isThemeMenuOpen: boolean = false;
  ngOnInit(): void {
    if (!this.githubId) {
      const token = localStorage.getItem('Fb-pA4lBUfsqVAWFN78eWDF');
      if (!token) {
        this.router.navigate(['/login']);
        return;
      }
      fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.status === 401) {
            this.router.navigate(['/login']);
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
        }).finally(() => {
          setTimeout(() => {
            this.getUser(this.githubId);
          }, 1000);
        });
    } 

    this.getUser(this.githubId);
  }

  private async getUser(githubId: string | undefined) {
    if (githubId) {
      const jwtToken = localStorage.getItem('FB_jwt_token');
      try {
        const response = await fetch(fetchUrl + '/api/user/' + githubId, {
          headers: {
            'Authorization': `Bearer ${jwtToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        console.log(data);
        if (data.maxSubmissions) {
          this.maxSubs = data.maxSubmissions;
          this.currentSubs = data.currentSubmissions;
          this.subscriptionTier = data.subscriptionTier;
          this.currentTheme = localStorage.getItem("theme") || "neutral";
          document.documentElement.className = this.currentTheme;
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        this.router.navigate(['/login']);
      }
    }
  }

  goToDocs() {
    window.open("https://docs.formbee.dev/docs");
  }
  goToBilling() {
    this.router.navigate(['/billing']);
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  constructor(private router: Router) {}

  logout(): void {
    console.log("Logging out");
    localStorage.removeItem("Fb-pA4lBUfsqVAWFN78eWDF");
    //redirect to login page
    window.location.href = "/home";
  }

  changeTheme(theme: string): void {
    this.currentTheme = theme;
    localStorage.setItem("theme", theme);
    console.log("Theme changed to " + theme);
    document.documentElement.className = this.currentTheme;
  }

  toggleThemeMenu(): void {
    this.isThemeMenuOpen = !this.isThemeMenuOpen;
  }

  openBilling(): void {
    // Pass the user's githubId to the billing component
    this.router.navigate(['/billing'], {state: {githubId: this.githubId}});
  }

  dashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}