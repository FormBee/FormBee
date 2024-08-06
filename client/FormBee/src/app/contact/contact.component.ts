import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgIf, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import 'altcha';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, NgIf, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ContactComponent implements OnInit, AfterViewInit {
  contactForm: FormGroup;
  altchaElement: HTMLElement | null = null;
  isVerified = false; // Flag to track verification state
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    private elRef: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }
  
  ngOnInit() {
    // Component setup can be done here
  }

  ngAfterViewInit() {
    // Set up the event listener after the view has initialized
    this.altchaElement = this.elRef.nativeElement.querySelector('.altcha');

    if (this.altchaElement) {
      this.renderer.listen(this.altchaElement, 'statechange', (ev) => {
        console.log('State change event fired:', ev);
        console.log('state:', ev.detail.state);
        if (ev.detail.state === 'verified') {
          this.isVerified = true;
          console.log('payload:', ev.detail.payload);
        } else {
          this.isVerified = false;
        }
        console.log('isVerified state:', this.isVerified);
      });
    } else {
      console.error('altchaElement not found');
    }
    console.log("altcha element: ", this.altchaElement);
  }

  // Handler for file input change
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0]; // Only take the first file
    }
  }

  onSubmit() {
    console.log(this.contactForm.value);

    if (this.isVerified) {
      this.http.post('http://localhost:3000/formbee/480b4617-0dd1-48d6-b10b-b45a33e24f75', this.contactForm.value).subscribe(res => {
        console.log(this.contactForm.value.email);
        console.log(res);
      });
    } else {
      if (!this.isVerified) {
        console.error('Cannot submit: Not verified.');
      }
      if (!this.selectedFile) {
        console.error('No file selected.');
      }
    }
  }
}