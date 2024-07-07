import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-nav',
  standalone: true,
  imports: [],
  templateUrl: './landing-nav.component.html',
  styleUrl: './landing-nav.component.scss'
})
export class LandingNavComponent {
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }
}
