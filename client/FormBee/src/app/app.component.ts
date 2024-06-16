import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContactComponent } from './contact/contact.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ContactComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'FormBee';
}
