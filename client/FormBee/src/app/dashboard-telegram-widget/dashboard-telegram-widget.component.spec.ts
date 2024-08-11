import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTelegramWidgetComponent } from './dashboard-telegram-widget.component';

describe('DashboardTelegramWidgetComponent', () => {
  let component: DashboardTelegramWidgetComponent;
  let fixture: ComponentFixture<DashboardTelegramWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardTelegramWidgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardTelegramWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
