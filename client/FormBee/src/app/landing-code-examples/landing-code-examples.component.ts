import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgClass } from '@angular/common';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup'; // Includes HTML

@Component({
  selector: 'app-landing-code-examples',
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  templateUrl: './landing-code-examples.component.html',
  styleUrls: ['./landing-code-examples.component.scss', '../../../node_modules/prismjs/themes/prism-tomorrow.css'] 
})
export class LandingCodeExamplesComponent implements OnInit{
  
  constructor(private sanitizer: DomSanitizer) {}

  currentCode: SafeHtml = '';
  isCopied: boolean = false; // add this line

  ngOnInit(): void {
    this.setCurrentFramework('vanilla');
  }

  frameworks: Record<'vanilla' | 'angular' | 'react' , string[]> = {
    angular: ['app.component.ts', 'app.component.html'],
    react: ['App.tsx'],
    vanilla: ['form.html', 'main.js']
  };

  codeSnippets: Record<'vanilla' | 'angular' | 'react', Record<string, { content: string, language: string }>> = {
    angular: {
      'app.component.ts': { content: `import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  contactForm: FormGroup;
  messageElement: HTMLElement | null = null;
  emailElement: HTMLElement | null = null;

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

  ngOnInit(): void {
    this.messageElement = this.elRef.nativeElement.querySelector('#message');
    this.emailElement = this.elRef.nativeElement.querySelector('#email');
  }

  onSubmit(): void {
    console.log(this.contactForm.value);
    this.http.post('https://api.formbee.dev/formbee/[APIKEY]', this.contactForm.value).subscribe(response => {
      console.log(response);
    });
  }
}
`, language: 'typescript' },
      'app.component.html': { content: `<h1>FormBee Angular Example</h1>
<form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
  <label for="email">Email</label>
  <input type="email" id="email" formControlName="email">
  <label for="message">Message</label>
  <textarea id="message" formControlName="message"></textarea>
  <button type="submit">Submit</button>
</form>`, language: 'markup' },
    },
    react: {
      'App.tsx': { content: `import { useState } from 'react';
import './App.css';


// Simple JSX form markup and logic
function App() {
  // include your fields here, you can add as many as you want, just make sure they are unique.
  const [formData, setFormData] = useState({ field1: '', field2: '', field3: '' });
  const apiKey = 'YOUR_API_KEY';

  // handle form data changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // send form data to FormBee
    fetch('https://api.formbee.dev/formbee/\${apiKey}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    }).then(response => {
      if (response.ok) {
        alert('Form submitted successfully');
      } else {
        alert('Form submission failed');
      }
    }).catch(err => {
      console.error('Error:', err);
      alert('Form submission failed');
    });
  };

  // render form
  return (
    <div className="App">
      {/* make submit button call handleSubmit */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            // make sure to include the name attribute
            name="field1"
            // set the initial value of the field
            value={formData.field1}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="field2"
            value={formData.field2}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            name="field3"
            value={formData.field3}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
`, language: 'jsx' },
    },
    vanilla: {
'form.html': { content: 
  `<!-- Simple form markup -->
<form id="form" action="https://api.formbee.dev/formbee/[APIKEY]" method="post" enctype="multipart/form-data">
    <input type="email" name="email">
    <textarea name="message"></textarea>
    <input type="submit" value="Submit">
</form>
<!-- Just provide your API key
with a post request to https://api.formbee.dev/formbee/
FormBee sends the form data to your email address. -->
 `, language: 'markup' },
      'main.js': { content: 
`// This code prevents the form from redirecting on submit.
const submitForm = async (event) => {
    event.preventDefault();
    const form = document.querySelector('#form');
    const response = await fetch(form.action, {
        method: form.method,
        body: new FormData(form)
    });
};
document.querySelector('#form').addEventListener('submit', submitForm);`, language: 'javascript' }
    }
  };

  currentFramework: 'vanilla' | 'angular' | 'react' = 'vanilla';
  currentFile: string = 'app.component.ts';
  currentFrameworkFiles: string[] = this.frameworks[this.currentFramework];

  setCurrentFramework(framework: 'vanilla' | 'angular' | 'react') {
    this.currentFramework = framework;    
    this.currentFrameworkFiles = this.frameworks[framework];
    this.currentFile = this.frameworks[framework][0];
    this.updateCode();
  }

  setCurrentFile(file: string) {
    this.currentFile = file;
    this.updateCode();
  }

  updateCode() {
    const rawCode = this.codeSnippets[this.currentFramework][this.currentFile].content;
    const language = this.codeSnippets[this.currentFramework][this.currentFile].language;
    this.currentCode = this.sanitizer.bypassSecurityTrustHtml(Prism.highlight(rawCode, Prism.languages[language], language));
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.codeSnippets[this.currentFramework][this.currentFile].content);
    this.isCopied = true; // show the copied message
    setTimeout(() => this.isCopied = false, 1000); // hide after 1 second
  }
}
