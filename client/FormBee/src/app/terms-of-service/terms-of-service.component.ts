import { Component } from '@angular/core';
import { LandingThreeBgComponent } from '../landing-three-bg/landing-three-bg.component';
import { LandingNavComponent } from '../landing-nav/landing-nav.component';
import { LandingFooterComponent } from '../landing-footer/landing-footer.component';
@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [
    LandingNavComponent,
    LandingThreeBgComponent,
    LandingFooterComponent,
  ],
  templateUrl: './terms-of-service.component.html',
  styleUrl: './terms-of-service.component.scss'
})
export class TermsOfServiceComponent {

}
