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
    this.stripe = await loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
    this.elements = this.stripe.elements();
    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          color: "#d6890e",
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: "#7a7979",

          },
          iconColor: "#7a7979",

        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a',
        },
      },
    });
    this.cardElement.mount('#card-element');
  }
  

  async handleFormSubmit() {



    this.stripe.createPaymentMethod({
      type: 'card',
      card: this.cardElement,
      billing_details: {
          name: 'Jenny Rosen',
      },
    }).then((result: { error: { message: any; }; paymentMethod: { id: any; }; }) => {
      if (result.error) {
        console.error(result.error.message);
        return;
      }
      console.log(result.paymentMethod.id); // Confirm that this logs the correct ID
    
      // Send the PaymentMethod ID to your server
      fetch(`http://localhost:3000/stripe/create-payment-method/${this.githubId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card: {
            id: result.paymentMethod.id,
          },
        }),
      }).then(response => response.json()).then(data => {
        console.log(data);
      }).catch(error => {
        console.error('Error processing the payment method:', error);
      });
    }).catch((error: any) => {
      console.error('Error creating payment method:', error);
    });
  }
}