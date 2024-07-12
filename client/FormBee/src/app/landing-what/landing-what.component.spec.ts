import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingWhatComponent } from './landing-what.component';

describe('LandingWhatComponent', () => {
  let component: LandingWhatComponent;
  let fixture: ComponentFixture<LandingWhatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingWhatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LandingWhatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
