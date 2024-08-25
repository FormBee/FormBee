import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StripeCardElementComponent } from './stripe-card-element.component';

describe('StripeCardElementComponent', () => {
  let component: StripeCardElementComponent;
  let fixture: ComponentFixture<StripeCardElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StripeCardElementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StripeCardElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
