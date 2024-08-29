import { Component } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { OnInit } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-stripe-card-element',
  standalone: true,
  imports: [],
  templateUrl: './stripe-card-element.component.html',
  styleUrl: './stripe-card-element.component.scss'
})
export class StripeCardElementComponent implements OnInit {
  stripe: any;
  cardElement: any;
  elements: any;
  @Input() githubId: string | undefined;

  async ngOnInit() {
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
      this.cardElement.mount('#card-element');
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }

  async handleFormSubmit() {
    console.log("handling form submit");
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
            // Display error.message in your UI
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
            });
        }
  }
      
}