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
  usagePercent = 50;
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
          console.log(dataman);
          this.apiKey = dataman.apiKey;
        });
    } else {
      console.log("API key found");
      this.apiKey = data.apiKey;
    }
  }

  ngOnInit(): void {
    if (!this.githubId) {
      return;
    }
    console.log("Github ID: ", this.githubId);
    this.fetchApiKey(this.githubId);
  }
}
