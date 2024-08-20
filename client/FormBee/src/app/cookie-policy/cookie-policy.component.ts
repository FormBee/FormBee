import { Component } from '@angular/core';
import { LandingNavComponent } from '../landing-nav/landing-nav.component';
import { LandingThreeBgComponent } from '../landing-three-bg/landing-three-bg.component';
import { LandingFooterComponent } from '../landing-footer/landing-footer.component';

@Component({
  selector: 'app-cookie-policy',
  standalone: true,
  imports: [
    LandingNavComponent,
    LandingThreeBgComponent,
    LandingFooterComponent,
  ],
  templateUrl: './cookie-policy.component.html',
  styleUrl: './cookie-policy.component.scss'
})
export class CookiePolicyComponent {

}
