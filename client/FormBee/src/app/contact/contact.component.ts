import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import ngForm from '@angular/forms';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import  'altcha';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ NgIf, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ContactComponent {

  contactForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message1: ['', Validators.required]
    });
  }
  
  onSubmit() {
    console.log(this.contactForm.value);
    
    this.http.post('http://localhost:3000/', this.contactForm.value).subscribe(res => {

      console.log(res);

    });

  }
}
