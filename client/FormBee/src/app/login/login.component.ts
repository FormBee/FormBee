import { Component, inject, signal } from '@angular/core';
import { LandingThreeBgComponent } from '../landing-three-bg/landing-three-bg.component';
import { Router, ActivatedRoute } from '@angular/router';
import { fetchUrl } from '../global-vars';

interface GithubUser {
  name: string | null;
  email: string | null;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LandingThreeBgComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private readonly router = inject(Router);
  
  private readonly user = signal<GithubUser>({ name: null, email: null });
  
  readonly userName = signal<string | null>(null);
  readonly userEmail = signal<string | null>(null);

  private readonly TOKEN_STORAGE_KEY = 'Fb-pA4lBUfsqVAWFN78eWDF';

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const githubToken = urlParams.get('token');
      const jwtToken = urlParams.get('jwt');

      if (!githubToken || !jwtToken) {
        console.log("here")
        return
      };

      await this.fetchUserData(githubToken);
      this.handleSuccessfulAuth(githubToken, jwtToken);
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  }

  private async fetchUserData(token: string): Promise<void> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GithubUser = await response.json();
      
      this.userName.set(data.name);
      this.userEmail.set(data.email);
      
      this.user.set({
        name: data.name,
        email: data.email
      });
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw error;
    }
  }

  private handleSuccessfulAuth(githubToken: string, jwtToken: string): void {
    localStorage.setItem(this.TOKEN_STORAGE_KEY, githubToken);
    localStorage.setItem('FB_jwt_token', jwtToken);
    
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${jwtToken}`);

    void this.router.navigate(['/dashboard']);
  }

  login(): void {
    const authUrl = `${fetchUrl}/auth/github`;
    window.location.href = authUrl;
  }

  landingPage(): void {
    void this.router.navigate(['/home']);
  }

  termsOfService(): void {
    void this.router.navigate(['/terms-of-service']);
  }
}