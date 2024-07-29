import { Component, Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
@Component({
  selector: 'app-dashboard-user-info',
  standalone: true,
  imports: [ NgIf ],
  templateUrl: './dashboard-user-info.component.html',
  styleUrl: './dashboard-user-info.component.scss'
})
export class DashboardUserInfoComponent implements OnInit {
  @Input() githubId: string | undefined;
  @Input() name: string | undefined;
  apiKey: string | undefined;
  displayApiKey: string | undefined;
  usagePercent = 50;
  currentSubs: number = 0.0;
  maxSubs: number = 0.0;
  localHostCurrentSubs: number = 0.0;
  localHostMaxSubs: number = 0.0;
  fetchApiKey = async (githubId: string) => {
    console.log("Fetching API key");
    const response = await fetch('http://localhost:3000/api/user/' + githubId);
    const data = await response.json();
    console.log(data);
    if (!data.apiKey) {
      console.log("No API key found");
      fetch('http://localhost:3000/create-api-key/' + githubId, {
        method: 'POST',
      })
        .then((response) => response.json())
        .then((dataman) => {
          if (dataman.apiKey) {
            this.apiKey = dataman.apiKey;
          }
          console.log(dataman);
        });
    } else {
      console.log("API key found");
      if (data.apiKey) {
        this.apiKey = data.apiKey;
        this.displayApiKey = this.apiKey;
        this.currentSubs = data.currentSubmissions;
        this.maxSubs = data.maxSubmissions;
        this.localHostCurrentSubs = data.localHostCurrentSubmissions;
        this.localHostMaxSubs = data.localHostMaxSubmissions;
        if (this.apiKey) {
          // Only show the last 4 characters of the API key
          this.displayApiKey = '*'.repeat(this.apiKey.length - 4) + this.apiKey.slice(this.apiKey.length - 4);
        }
      }
    }
  }

  copyToClipboard = () => {
      if(this.apiKey) {
        navigator.clipboard.writeText(this.apiKey);
      }
  }

  newApiKey = () => {
    fetch('http://localhost:3000/regenerate-api-key/' + this.githubId, {
      method: 'post',
    })
    .then((response) => response.json())
    .then((dataman) => {
      if (dataman.apiKey) {
        this.apiKey = dataman.apiKey;
        this.displayApiKey = this.apiKey;
        if (this.apiKey) {
          // Only show the last 4 characters of the API key
          this.displayApiKey = '*'.repeat(this.apiKey.length - 4) + this.apiKey.slice(this.apiKey.length - 4);
        }
      }
     });
  }

  ngOnInit(): void {
    if (!this.githubId) {
      return;
    }
    console.log("Github ID: ", this.githubId);
    this.fetchApiKey(this.githubId);
  }
}
