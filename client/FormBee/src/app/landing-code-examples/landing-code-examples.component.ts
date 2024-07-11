import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgFor } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';

@Component({
  selector: 'app-landing-code-examples',
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: true,
  imports: [NgFor],
  templateUrl: './landing-code-examples.component.html',
  styleUrls: ['./landing-code-examples.component.scss', '../../../node_modules/prismjs/themes/prism-okaidia.min.css']
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

  codeSnippets: Record<'vanilla' | 'angular' | 'react', Record<string, string>> = {
    angular: {
      'app.component.ts': 'console.log("Angular app.component.ts code here")',
      'app.module.ts': '/* Angular app.module.ts code here */',
    },
    react: {
      'App.js': '/* React App.js code here */',
      'index.js': '/* React index.js code here */',
    },
    vanilla: {
      'form.html': `<form id="form" action="https://formbee.dev/[APIKEY]" method="post" enctype="multipart/form-data">
    <input type="email" name="email">
    <textarea name="message"></textarea>
    <input type="submit" value="Submit">
</form>`,
      'main.js': '/* main.js code here */',
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
    const rawCode = this.codeSnippets[this.currentFramework][this.currentFile];
    const language = this.getLanguage(this.currentFramework);
    this.currentCode = this.sanitizer.bypassSecurityTrustHtml(Prism.highlight(rawCode, Prism.languages[language], language));
  }

  getLanguage(framework: 'vanilla' | 'angular' | 'react'): string {
    switch (framework) {
      case 'angular': return 'ts';
      case 'react': return 'jsx';
      case 'vanilla': return 'html';
      default: return 'markup';
    }
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.codeSnippets[this.currentFramework][this.currentFile]);
  }
}