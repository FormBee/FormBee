import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CardStateService {
  cardState: boolean = false;

  updateCardState() {
    this.cardState = !this.cardState;
  }
  constructor() {}
}
