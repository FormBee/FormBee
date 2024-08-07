import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardReturnModalComponent } from './dashboard-return-modal.component';

describe('DashboardReturnModalComponent', () => {
  let component: DashboardReturnModalComponent;
  let fixture: ComponentFixture<DashboardReturnModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardReturnModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardReturnModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
