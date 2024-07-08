import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingThreeBgComponent } from './landing-three-bg.component';

describe('LandingThreeBgComponent', () => {
  let component: LandingThreeBgComponent;
  let fixture: ComponentFixture<LandingThreeBgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingThreeBgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LandingThreeBgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
