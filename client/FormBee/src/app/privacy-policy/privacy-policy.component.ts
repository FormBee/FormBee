import { Component } from '@angular/core';
import { LandingNavComponent } from '../landing-nav/landing-nav.component';
import { LandingThreeBgComponent } from '../landing-three-bg/landing-three-bg.component';
import { LandingFooterComponent } from '../landing-footer/landing-footer.component';
@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [
    LandingNavComponent,
    LandingThreeBgComponent,
    LandingFooterComponent,
  ],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {

}
