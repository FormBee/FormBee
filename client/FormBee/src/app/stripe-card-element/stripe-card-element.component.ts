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
    this.cardElement = this.elements.create('card');
    this.cardElement.mount('#card-element');
  }

  async handleFormSubmit() {
    const { paymentMethod, error } = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.cardElement,
      billing_details: {
        name: 'Customer Name',
      },
    });

    if (error) {
      console.error(error);
    } else {
      console.log(paymentMethod);
    }
  }
}