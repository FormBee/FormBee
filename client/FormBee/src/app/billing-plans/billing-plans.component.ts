import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-billing-plans',
  standalone: true,
  imports: [
    NgIf,
  ],
  templateUrl: './billing-plans.component.html',
  styleUrl: './billing-plans.component.scss'
})
export class BillingPlansComponent {
  @Input() githubId: string | undefined;
  @Input() subscriptionTier: string | undefined;
  constructor(private router: Router) {}

  upgradeToGrowth() {
    console.log("upgrading to growth");
    this.router.navigate(['/growth-plan']);
  }
}
