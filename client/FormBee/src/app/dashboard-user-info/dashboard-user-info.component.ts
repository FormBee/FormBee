import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-user-info',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-user-info.component.html',
  styleUrl: './dashboard-user-info.component.scss'
})
export class DashboardUserInfoComponent {
  usagePercent = 50;
}
