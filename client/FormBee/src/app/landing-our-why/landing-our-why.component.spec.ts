import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingOurWhyComponent } from './landing-our-why.component';

describe('LandingOurWhyComponent', () => {
  let component: LandingOurWhyComponent;
  let fixture: ComponentFixture<LandingOurWhyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingOurWhyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LandingOurWhyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
