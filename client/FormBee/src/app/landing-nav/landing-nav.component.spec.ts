import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingNavComponent } from './landing-nav.component';

describe('LandingNavComponent', () => {
  let component: LandingNavComponent;
  let fixture: ComponentFixture<LandingNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingNavComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LandingNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
