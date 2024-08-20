import { Routes } from '@angular/router';
import { ContactComponent } from './contact/contact.component';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { CookiePolicyComponent } from './cookie-policy/cookie-policy.component';
export const routes: Routes = [
    { path: 'test', component: ContactComponent },
    { path: 'home', component: LandingComponent, pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], },
    { path: 'privacy-policy', component: PrivacyPolicyComponent },
    { path: 'terms-of-service', component: TermsOfServiceComponent },
    { path: 'cookies-policy', component: CookiePolicyComponent },
    { path: '**', redirectTo: '/home'},
];