import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingFeaturesComponent } from './landing-features.component';

describe('LandingFeaturesComponent', () => {
  let component: LandingFeaturesComponent;
  let fixture: ComponentFixture<LandingFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingFeaturesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LandingFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
