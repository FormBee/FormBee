import { Component, Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
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
  themes: string[] = ['Default', 'Dark', 'Light', 'High Contrast'];
  currentTheme: string = 'Default';
  isThemeMenuOpen: boolean = false;

  ngOnInit(): void {
    const getUser = async (githubId: string | undefined) => {
      if (githubId) {
        const response = await fetch('http://localhost:3000/api/user/' + githubId);
        const data = await response.json();
        console.log(data);
        if (data.maxSubmissions) {
          this.maxSubs = data.maxSubmissions;
          this.currentSubs = data.currentSubmissions;
          this.subscriptionTier = data.subscriptionTier;
          this.currentTheme = localStorage.getItem("theme") || "Default";
        }
      }
    };
    getUser(this.githubId);
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

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
  }

  toggleThemeMenu(): void {
    this.isThemeMenuOpen = !this.isThemeMenuOpen;
  }
}