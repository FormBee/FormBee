import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-code-examples',
  standalone: true,
  imports: [],
  templateUrl: './landing-code-examples.component.html',
  styleUrls: ['./landing-code-examples.component.scss']
})
export class LandingCodeExamplesComponent {
  frameworks: Record<'vanilla' | 'angular' | 'react' , string[]> = {
    angular: ['app.component.ts', 'app.module.ts'],
    react: ['App.js', 'index.js'],
    vanilla: ['App.vue', 'main.js']
  };

  codeSnippets: Record<'vanilla' | 'angular' | 'react' , Record<string, string>> = {
    angular: {
      'app.component.ts': '/* Angular app.component.ts code here */',
      'app.module.ts': '/* Angular app.module.ts code here */',
    },
    react: {
      'App.js': '/* React App.js code here */',
      'index.js': '/* React index.js code here */',
    },
    vanilla: {
      'App.vue': '/* Vue App.vue code here */',
      'main.js': '/* Vue main.js code here */',
    }
  };

  currentFramework:'vanilla' | 'angular' | 'react' = 'vanilla';
  currentFile: string = 'app.component.ts';
  currentFrameworkFiles: string[] = this.frameworks[this.currentFramework];
  currentCode: string = this.codeSnippets[this.currentFramework][this.currentFile];

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
    this.currentCode = this.codeSnippets[this.currentFramework][this.currentFile];
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.currentCode);
  }
}