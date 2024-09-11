import { Component } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { CardStateService } from '../card-state.service';
@Component({
  selector: 'app-stripe-card-element',
  standalone: true,
  imports: [
    NgIf,
  ],
  templateUrl: './stripe-card-element.component.html',
  styleUrl: './stripe-card-element.component.scss'
})
export class StripeCardElementComponent implements OnInit {
  stripe: any;
  cardElement: any;
  elements: any;
  @Input() githubId: string | undefined;
  errorMessage: string | undefined;
  constructor(public cardStateService: CardStateService) {
  }
  async ngOnInit() {
    fetch('https://api.formbee.dev/get-default-payment-method/' + this.githubId, { method: 'GET' }).then(response => response.json()).then(data => {
      if (data.paymentMethod) {
        this.cardStateService.cardState = true;
      }
    });
    try {
      this.stripe = await loadStripe('pk_live_51Pr6BYP65EGyHpMvxUcAi3vWtb50ReyDoHAHfTZK4xLcHCuiNnb28CXDtyN8HgOFFt0rm5mv1HSkpwJjd7DcmLNY00nG6HJap2');


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
      this.cardElement.mount('#card-element');
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }

  cancel () {
    this.cardStateService.cardState = false;
  }

  async handleFormSubmit() {
    console.log("handling form submit");
    const response = await fetch('https://api.formbee.dev/create-setup-intent/' + this.githubId, { method: 'POST' });
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
            fetch('https://api.formbee.dev/save-card/' + this.githubId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentMethodId: setupIntent.payment_method,
                }),
            });
            window.location.reload();
        }
  }
      
}