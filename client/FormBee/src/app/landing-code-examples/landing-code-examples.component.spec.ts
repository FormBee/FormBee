import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingCodeExamplesComponent } from './landing-code-examples.component';

describe('LandingCodeExamplesComponent', () => {
  let component: LandingCodeExamplesComponent;
  let fixture: ComponentFixture<LandingCodeExamplesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingCodeExamplesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LandingCodeExamplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
