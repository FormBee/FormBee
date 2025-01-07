import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgIf, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import 'altcha';
import { ReactiveFormsModule } from '@angular/forms';
import { LandingThreeBgComponent } from '../landing-three-bg/landing-three-bg.component';
import { LandingNavComponent } from '../landing-nav/landing-nav.component';
import { LandingFooterComponent } from '../landing-footer/landing-footer.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, NgIf, ReactiveFormsModule, LandingThreeBgComponent, LandingNavComponent, LandingFooterComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ContactComponent implements OnInit, AfterViewInit {
  contactForm: FormGroup;
  altchaElement: HTMLElement | null = null;
  isVerified = false; // Flag to track verification state
  honeyElement: HTMLElement | null = null;
  messageElement: HTMLElement | null = null;
  emailElement: HTMLElement | null = null;
  needMessage: boolean = false;
  needEmail: boolean = false;
  needValidEmail: boolean = false;
  captchaDone: boolean = true;
  formComplete: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    private elRef: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }
  
  ngOnInit() {
    this.honeyElement = this.elRef.nativeElement.querySelector('#honey');
    this.messageElement = this.elRef.nativeElement.querySelector('#message');
    this.emailElement = this.elRef.nativeElement.querySelector('#email');
  }

  ngAfterViewInit() {
    // Set up the event listener after the view has initialized
    this.altchaElement = this.elRef.nativeElement.querySelector('.altcha');
    if (this.altchaElement) {
      this.renderer.listen(this.altchaElement, 'statechange', (ev) => {
        if (ev.detail.state === 'verified') {
          this.isVerified = true;
        } else {
          return;
        }
      });
    } else {
      return;
    }
  }

  onSubmit() {
    this.needMessage = false;
    this.needEmail = false;
    this.needValidEmail = false;
    if (this.contactForm.invalid) {
      const message = this.messageElement as HTMLInputElement;
      const email = this.emailElement as HTMLInputElement;
      if (!message.value) {
        this.needMessage = true;
        return;
      } else if (!email.value) {
        this.needEmail = true;
        return;
      } else if (!email.validity.typeMismatch) {
        this.needValidEmail = true;
        return;
      } else {
        return;
      }
    } else {
      const honeyInputElement = this.honeyElement as HTMLInputElement;
      if (honeyInputElement && honeyInputElement.value) {
        return;
      }
      if (this.isVerified) {
          this.http.post('https://api.formbee.dev/formbee/6b7707e8-f3bb-44d1-8b5d-62e01971f4bf', this.contactForm.value).subscribe(res => {
          this.formComplete = true;
          this.contactForm.reset();
          setTimeout(() => {
            this.formComplete = false;
          }, 5000);
        });
      } else {
        if (!this.isVerified) {
          this.captchaDone = false;
        }
      }
    }
  }
}