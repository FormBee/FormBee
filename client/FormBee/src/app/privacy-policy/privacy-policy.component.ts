import { Component } from '@angular/core';
import { LandingNavComponent } from '../landing-nav/landing-nav.component';
import { LandingThreeBgComponent } from '../landing-three-bg/landing-three-bg.component';
@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [LandingNavComponent,
    LandingThreeBgComponent,
  ],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {

}
