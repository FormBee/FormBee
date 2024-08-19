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
    { icon: 'https://gliscfokeivkvdrwzlsv.supabase.co/storage/v1/object/public/Plugin%20images/n8n%20logo.png', name: 'n8n logo', description: 'Create automations on n8n.io with your form data.' },
    { icon: 'https://gliscfokeivkvdrwzlsv.supabase.co/storage/v1/object/public/Plugin%20images/slack%20logo.png', name: 'Slack logo', description: 'Receive your form submissions in your Slack channel.' },
    { icon: 'https://gliscfokeivkvdrwzlsv.supabase.co/storage/v1/object/public/Plugin%20images/discord%20logo.webp', name: 'Discord logo', description: 'Receive your form submissions in your discord channel.' },
    { icon: 'https://gliscfokeivkvdrwzlsv.supabase.co/storage/v1/object/public/Plugin%20images/make%20logo.png', name: 'Make logo', description: 'Create automations on make.com with your form data.' },
    { icon: 'https://gliscfokeivkvdrwzlsv.supabase.co/storage/v1/object/public/Plugin%20images/Telegram-Logo.png', name: 'Telegram logo', description: 'Receive your form submissions via Telegram.' },
    { icon: 'https://gliscfokeivkvdrwzlsv.supabase.co/storage/v1/object/public/Plugin%20images/wehhook%20logo.png', name: 'Webhook logo', description: 'Reveive your form submissions with custom webhooks.' },

  ];

  currentPluginIndex = 0;

  ngOnInit() {
    setInterval(() => {
      this.currentPluginIndex = (this.currentPluginIndex + 1) % this.plugins.length;
    }, 5000);
  }
}
