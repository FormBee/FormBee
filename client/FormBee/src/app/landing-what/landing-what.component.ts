import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-landing-what',
  standalone: true,
  imports: [CommonModule, NgFor],
  templateUrl: './landing-what.component.html',
  styleUrl: './landing-what.component.scss'
})
export class LandingWhatComponent implements OnInit {
  plugins = [
    { icon: 'https://pgtgy4em2f.ufs.sh/f/oMW3imFO9N6PhUrhRH9oNEvT3zUg8ShqaJ7yIfuC2rmDVjnp', name: 'Return logo', description: 'Send an automatic reply email from your email address.' },
    { icon: 'https://pgtgy4em2f.ufs.sh/f/oMW3imFO9N6Pa1cDi3IdtKLjOUncgNeulwxE40SBZHF6XdQC', name: 'n8n logo', description: 'Create automations on n8n.io with your form data.' },
    // { icon: 'https://gliscfokeivkvdrwzlsv.supabase.co/storage/v1/object/public/Plugin%20images/slack%20logo.png', name: 'Slack logo', description: 'Receive your form submissions in your Slack channel.' },
    { icon: 'https://pgtgy4em2f.ufs.sh/f/oMW3imFO9N6PSmiJaLNB0zJC6DQF28kIwYEHsdoeNgPUTlWS', name: 'Discord logo', description: 'Receive your form submissions in your discord channel.' },
    { icon: 'https://pgtgy4em2f.ufs.sh/f/oMW3imFO9N6PgfmW5Q6uhT2XaGNP3VOC10UYjb6AWywDpiBE', name: 'Make logo', description: 'Create automations on make.com with your form data.' },
    { icon: 'https://pgtgy4em2f.ufs.sh/f/oMW3imFO9N6PcgEnoCvbMOvsrnRhEwqLJa7FIe6Gtj0Cg5Wl', name: 'Telegram logo', description: 'Receive your form submissions via Telegram.' },
    { icon: 'https://pgtgy4em2f.ufs.sh/f/oMW3imFO9N6PzukFbxWEBo2Su7PjCQAxm0LK6gfU51spibdD', name: 'Webhook logo', description: 'Receive your form submissions with custom webhooks.' },

  ];

  currentPluginIndex = 0;

  ngOnInit() {
    setInterval(() => {
      this.currentPluginIndex = (this.currentPluginIndex + 1) % this.plugins.length;
    }, 5000);
  }
}
