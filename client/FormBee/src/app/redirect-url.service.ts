import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RedirectUrlService {
  // redirectUrl: string = "https://formbee.dev";
  redirectUrl: string = "https://api.formbee.dev";
  // redirectUrl: string = "http://localhost:3000";
  static redirectUrl: string;
  constructor() { }
}
