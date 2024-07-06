import { Routes } from '@angular/router';
import { ContactComponent } from './contact/contact.component';
import { LandingComponent } from './landing/landing.component';
export const routes: Routes = [
    { path: 'test', component: ContactComponent },
    { path: 'home', component: LandingComponent},
    { path: '**', redirectTo: '/home' },
];
