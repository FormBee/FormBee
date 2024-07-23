import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardUserInfoComponent } from './dashboard-user-info.component';

describe('DashboardUserInfoComponent', () => {
  let component: DashboardUserInfoComponent;
  let fixture: ComponentFixture<DashboardUserInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardUserInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardUserInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
