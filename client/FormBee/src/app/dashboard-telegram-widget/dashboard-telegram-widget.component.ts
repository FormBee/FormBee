import { Component, Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { DashboardReturnModalComponent } from '../dashboard-return-modal/dashboard-return-modal.component';
import { ViewChild, ElementRef } from '@angular/core';
@Component({
  selector: 'app-dashboard-telegram-widget',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-telegram-widget.component.html',
  styleUrl: './dashboard-telegram-widget.component.scss'
})
export class DashboardTelegramWidgetComponent implements OnInit {
  @Input() githubId: string | undefined;
  ngOnInit(): void {
    if (!this.githubId) {
      return;
    }
    console.log("Github ID: ", this.githubId);
    this.convertToScript();
  }

  @ViewChild('script', {static: true}) script!: ElementRef;
  convertToScript() {
    const element = this.script.nativeElement;
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', "FormbeeBot");
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-auth-url', 'https://api.formbee.dev/oauth/telegram/' + this.githubId);
    script.setAttribute('data-request-access', 'write');
    element.parentElement.replaceChild(script, element);
  }
}
