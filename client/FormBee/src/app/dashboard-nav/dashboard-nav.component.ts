import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-nav',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-nav.component.html',
  styleUrl: './dashboard-nav.component.scss'
})
export class DashboardNavComponent {
  @Input() name: string | undefined;
  @Input() login: string | undefined;
  @Input() profilePic: string | undefined;
}
