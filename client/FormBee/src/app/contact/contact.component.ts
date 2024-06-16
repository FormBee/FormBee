import { Component } from '@angular/core';
import ngForm from '@angular/forms';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {

  contactForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }
  onSubmit() {
    console.log("this.contactForm.value");
  }
}
