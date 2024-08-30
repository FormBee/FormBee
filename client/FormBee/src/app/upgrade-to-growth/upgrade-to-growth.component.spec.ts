import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpgradeToGrowthComponent } from './upgrade-to-growth.component';

describe('UpgradeToGrowthComponent', () => {
  let component: UpgradeToGrowthComponent;
  let fixture: ComponentFixture<UpgradeToGrowthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpgradeToGrowthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpgradeToGrowthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
