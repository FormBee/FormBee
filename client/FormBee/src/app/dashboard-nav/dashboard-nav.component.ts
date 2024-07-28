import { Component, Input } from '@angular/core';
import { OnInit } from '@angular/core';
@Component({
  selector: 'app-dashboard-nav',
  standalone: true,
  imports: [],
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
        }
      }
    };
    getUser(this.githubId);
  }
}