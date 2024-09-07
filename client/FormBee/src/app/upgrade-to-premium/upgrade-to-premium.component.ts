import { Component } from '@angular/core';
import { DashboardNavComponent } from '../dashboard-nav/dashboard-nav.component';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { ElementRef, afterRender } from '@angular/core';
import { NgIf } from '@angular/common';
import { AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-upgrade-to-premium',
  standalone: true,
  imports: [
    DashboardNavComponent,
    NgIf,
  ],
  templateUrl: './upgrade-to-premium.component.html',
  styleUrl: './upgrade-to-premium.component.scss'
})
export class UpgradeToPremiumComponent implements OnInit, AfterViewInit {
  name: string | undefined;
  login: string | undefined;
  profilePic: string = "../assets/FormBee-logo2.png";
  githubId: string | undefined;
  loading: boolean = true;
  fetchUrl: string = "http://localhost:3000/";
  stripe: any;
  cardElement: any;
  elements: any;
  cardStateService: any;
  errorMessage: string | undefined;
  last4Digits: string|undefined;
  customerId: string | undefined;
  subscriptionLoading: boolean = false;

  constructor(private Router: Router, elementRef: ElementRef) {}

  async ngAfterViewInit() {
    try {
      this.stripe = await loadStripe('pk_test_51Pr6BYP65EGyHpMvJu2vuS3MLMOhJZZP6jSH51HwgXuvUfwYjTXJFpab6JDmVKp9osFFPmiK18Hfd7HnY8ZrF2Q700AWZClCOT');
      this.elements = this.stripe.elements();
      this.cardElement = this.elements.create('card', {

        style: {
          base: {
            color: '#d6890e',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
              color: '#7a7979'
            },
            iconColor: '#7a7979'
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
          }
        }
      });
      // tech debt: this is a hack to make sure the element exists before mounting it.
      for (let i = 0; i <=3; i++) {
        console.log("i: ", i);
        setTimeout(() => {
          this.cardElement.mount('#card-element');
        }, i * 1000);
      }
    } catch (error) {
    }
  }

    async ngOnInit() {
      // Get the theme
      const theme = localStorage.getItem("theme");
      if (theme) {
        document.documentElement.className = theme;
      }
      const token = localStorage.getItem('Fb-pA4lBUfsqVAWFN78eWDF');
      if (!token) {
        this.Router.navigate(['/login']);
        return;
      } else {
        console.log("Token found");
        fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => {
            if (response.status === 401) {
              this.Router.navigate(['/login']);
              return;
            }
            return response.json();
          })
          .then((data) => {
            if (data) {
              console.log("Data: ", data);
              if (data.name) {
                this.name = data.name;
              } else {
                this.name = data.login;
              }
              this.profilePic = data.avatar_url;
              this.githubId = data.id;
            }
          }).then(() => {
            fetch(this.fetchUrl + 'api/user/' + this.githubId).then(response => response.json()).then(data => {
              console.log("fetched user data");
              this.customerId = data.stripeCustomerId;
            });
          }).then(async () => {
            fetch('http://localhost:3000/get-default-payment-method/' + this.githubId, { method: 'GET' }).then(response => response.json()).then(data => {
              if (data.paymentMethod) {
                this.last4Digits = data.paymentMethod.card.last4;
                this.loading = false;
              }
            });
          }).finally(() => {
            this.loading = false;
          });
      }
    }

    goToBilling() {
      this.Router.navigate(['/billing']);
    }

    async handleFormSubmit() {
      this.subscriptionLoading = true;
      console.log("handling form submit");
      if (this.last4Digits) { 
        console.log("cardOnFile: ", this.last4Digits);
        const response = await fetch('http://localhost:3000/stripe/premium-plan/' + this.githubId, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const { subscription } = await response.json();
        console.log("Subscription: ", subscription);
        if (subscription.status === 'active') {
          this.subscriptionLoading = false;
          this.Router.navigate(['/dashboard']);
        } else {
          this.subscriptionLoading = false;
          console.log("Subscription not active, add error message");
        }
      } else {
        console.log("no card on file");
          const response = await fetch('http://localhost:3000/create-setup-intent/' + this.githubId, { method: 'POST' });
          const { clientSecret } = await response.json();
  
          const { error, setupIntent } = await this.stripe.confirmCardSetup(
              clientSecret,
              {
                  payment_method: {
                      card: this.cardElement,
                  }
              }
          );
          if (error) {
              console.error(error);
              this.errorMessage = error.message;
              setTimeout(() => {
                  this.errorMessage = undefined;
              }, 6000);
          } else {
              console.log('Payment method saved:', setupIntent.payment_method);
              fetch('http://localhost:3000/save-card/' + this.githubId, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      paymentMethodId: setupIntent.payment_method,
                  }),
                  
              }).then(async () => {
                const response = await fetch('http://localhost:3000/stripe/premium-plan/' + this.githubId, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
                const { subscription } = await response.json();
                if (subscription.status === 'active') {
                  this.subscriptionLoading = false;
                  this.Router.navigate(['/dashboard']);
                } else {
                  this.subscriptionLoading = false;
                  console.log("Subscription unsuccessful.");
                }
              });
              
          }
        }
    }
  }