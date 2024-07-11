import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgFor } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup'; // Includes HTML

@Component({
  selector: 'app-landing-code-examples',
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: true,
  imports: [NgFor],
  templateUrl: './landing-code-examples.component.html',
  styleUrls: ['./landing-code-examples.component.scss', '../../../node_modules/prismjs/themes/prism-tomorrow.css'] 
})
export class LandingCodeExamplesComponent implements OnInit{
  
  constructor(private sanitizer: DomSanitizer) {}

  currentCode: SafeHtml = '';

  ngOnInit(): void {
    this.setCurrentFramework('vanilla');
  }

  frameworks: Record<'vanilla' | 'angular' | 'react' , string[]> = {
    angular: ['app.component.ts', 'app.module.ts'],
    react: ['App.js', 'index.js'],
    vanilla: ['form.html', 'main.js']
  };

  codeSnippets: Record<'vanilla' | 'angular' | 'react', Record<string, { content: string, language: string }>> = {
    angular: {
      'app.component.ts': { content: 'console.log("Angular app.component.ts code here")', language: 'typescript' },
      'app.module.ts': { content: '/* Angular app.module.ts code here */', language: 'typescript' },
    },
    react: {
      'App.js': { content: '/* React App.js code here */', language: 'jsx' },
      'index.js': { content: '/* React index.js code here */', language: 'jsx' },
    },
    vanilla: {
'form.html': { content: 
  `<!-- Simple form markup -->
<form id="form" action="https://formbee.dev/[APIKEY]" method="post" enctype="multipart/form-data">
    <input type="email" name="email">
    <textarea name="message"></textarea>
    <input type="submit" value="Submit">
</form>
<!-- Just provide your API key
with a post request to https://formbee.dev/
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
  }
}