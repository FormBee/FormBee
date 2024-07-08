import { Component } from '@angular/core';
import { LandingNavComponent } from '../landing-nav/landing-nav.component';
import { LandingHeaderComponent } from '../landing-header/landing-header.component';
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [LandingNavComponent, LandingHeaderComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
}

