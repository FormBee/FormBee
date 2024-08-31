import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpgradeToPremiumComponent } from './upgrade-to-premium.component';

describe('UpgradeToPremiumComponent', () => {
  let component: UpgradeToPremiumComponent;
  let fixture: ComponentFixture<UpgradeToPremiumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpgradeToPremiumComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpgradeToPremiumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
