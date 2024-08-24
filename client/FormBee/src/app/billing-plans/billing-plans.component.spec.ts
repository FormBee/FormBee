import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingPlansComponent } from './billing-plans.component';

describe('BillingPlansComponent', () => {
  let component: BillingPlansComponent;
  let fixture: ComponentFixture<BillingPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingPlansComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BillingPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
