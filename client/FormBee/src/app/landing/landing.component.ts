import { Component } from '@angular/core';
import { LandingNavComponent } from '../landing-nav/landing-nav.component';
import { LandingHeaderComponent } from '../landing-header/landing-header.component';
import { LandingThreeBgComponent } from '../landing-three-bg/landing-three-bg.component';
import { LandingCodeExamplesComponent } from '../landing-code-examples/landing-code-examples.component';
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [LandingNavComponent, LandingHeaderComponent, LandingThreeBgComponent, LandingCodeExamplesComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
}

