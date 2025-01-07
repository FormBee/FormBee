import { Component, Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { DashboardReturnModalComponent } from '../dashboard-return-modal/dashboard-return-modal.component';
import { ViewChild, ElementRef } from '@angular/core';
import { DashboardTelegramWidgetComponent } from '../dashboard-telegram-widget/dashboard-telegram-widget.component';
import { FormsModule } from '@angular/forms';
import { fetchUrl } from '../global-vars';
@Component({
  selector: 'app-dashboard-user-info',
  standalone: true,
  imports: [ 
    NgIf,
    DashboardReturnModalComponent,
    DashboardTelegramWidgetComponent,
    FormsModule,
    NgFor,
   ],
  templateUrl: './dashboard-user-info.component.html',
  styleUrl: './dashboard-user-info.component.scss'
})
export class DashboardUserInfoComponent implements OnInit {
  @Input() githubId: string | undefined;
  @Input() name: string | undefined;
  @Input() currentTheme: string | undefined;
  apiKey: string | undefined;
  displayApiKey: string | undefined;
  usagePercent = 50;
  currentSubs: number = 0.0;
  subscriptionTier: string | undefined;
  maxSubs: number = 0.0;
  localHostCurrentSubs: number = 0.0;
  localHostMaxSubs: number = 0.0;
  email: string = "Loading email...";
  emailValid: boolean = false;
  googleEmail: string | undefined;
  returnEmailModal: boolean = false;
  smtpHost: string | undefined;
  smtpPort: number | undefined;
  smtpUsername: string | undefined;
  smtpPassword: string | undefined;
  emailSubject: string | undefined;
  emailBody: string | undefined;
  returnEmailBoolean: boolean = false;
  telegramModal: boolean = false;
  telegramEnabled: boolean = false;
  telegramChat: string | undefined;
  discordModal: boolean = false;
  discordEnabled: boolean = false;
  discordWebhook: string | undefined;
  slackModal: boolean = false;
  slackEnabled: boolean = false;
  slackChannelName: string | undefined;
  makeEnabled: boolean = false;
  makeWebhook: string | undefined;
  makeModal: boolean = false;
  n8nEnabled: boolean = false;
  n8nWebhook: string | undefined;
  n8nModal: boolean = false;
  webhookModal: boolean = false;
  webhookEnabled: boolean = false;
  webhookWebhook: string | undefined;
  maxPlugins: number | null = 0;
  currentPlugins: number | null = 0;
  themes: string[] = ['Default', 'elegent-theme', 'light-theme'];
  domains: string[] = [];
  // fetchUrl: string = "http://localhost:3000/";
  // fetchUrl: string = "https://pleasing-love-production.up.railway.app/";


  fetchApiKey = async (githubId: string) => {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    const response = await fetch(fetchUrl + '/api/user/' + githubId, {
        headers: {
            'Authorization': `Bearer ${jwtToken}`
        }
    });
    const data = await response.json();
    console.log(data);
    if (!data.apiKey) {
      fetch(fetchUrl + '/create-api-key/' + githubId, {
        method: 'POST',
      })
        .then((response) => response.json())
        .then((dataman) => {
          if (dataman.apiKey) {
            this.apiKey = dataman.apiKey;
            if (this.apiKey) {
              // Only show the last 4 characters of the API key
              this.displayApiKey = '*'.repeat(this.apiKey.length - 4) + this.apiKey.slice(this.apiKey.length - 4);
            }
          }
          this.currentSubs = data.currentSubmissions;
          this.maxSubs = data.maxSubmissions;
          this.localHostMaxSubs = data.localHostMaxSubmissions;
          this.email = data.email;
        });
    } else {
      console.log("API key found");
      if (data.apiKey) {
        this.apiKey = data.apiKey;
        this.displayApiKey = this.apiKey;
        this.currentSubs = data.currentSubmissions;
        this.maxSubs = data.maxSubmissions;
        this.localHostCurrentSubs = data.localHostCurrentSubmissions;
        this.localHostMaxSubs = data.localHostMaxSubmissions;
        this.email = data.email;
        if (data.fromEmail) {
          this.googleEmail = data.fromEmail;
        } else {
          this.googleEmail = data.smtpUsername;
        }
        this.smtpHost = data.smtpHost;
        this.smtpPort = data.smtpPort;
        this.smtpUsername = data.smtpUsername;
        this.smtpPassword = data.smtpPassword;
        this.emailSubject = data.emailSubject;
        this.emailBody = data.emailBody;
        this.returnEmailBoolean = data.returnBoolean;
        this.telegramEnabled = data.telegramBoolean;
        this.telegramChat = data.telegramChatId;
        this.discordEnabled = data.discordBoolean;
        this.discordWebhook = data.discordWebhook;
        this.slackEnabled = data.slackBoolean;
        this.slackChannelName = data.slackChannelName
        this.makeEnabled = data.makeBoolean;
        this.makeWebhook = data.makeWebhook;
        this.n8nEnabled = data.n8nBoolean;
        this.n8nWebhook = data.n8nWebhook;
        this.webhookEnabled = data.webhookBoolean;
        this.webhookWebhook = data.webhookWebhook;
        this.maxPlugins = data.maxPlugins;
        this.subscriptionTier = data.subscriptionTier;
        this.currentPlugins = data.currentPlugins;
        this.domains = data.allowedDomains;

        if (this.apiKey) {
          this.displayApiKey = '*'.repeat(this.apiKey.length - 4) + this.apiKey.slice(this.apiKey.length - 4);
        }
      }
    }
  }

  copyToClipboard = () => {
      if(this.apiKey) {
        navigator.clipboard.writeText(this.apiKey);
      }
  }

  newApiKey = () => {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    fetch(fetchUrl + '/regenerate-api-key/' + this.githubId, {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    })
    .then((response) => response.json())
    .then((dataman) => {
      if (dataman.apiKey) {
        this.apiKey = dataman.apiKey;
        this.displayApiKey = this.apiKey;
        if (this.apiKey) {
          // Only show the last 4 characters of the API key
          this.displayApiKey = '*'.repeat(this.apiKey.length - 4) + this.apiKey.slice(this.apiKey.length - 4);
        }
      }
     });
  }

  openReturnEmailModal = () => {
    this.returnEmailModal = true;
  }

  closeReturnEmailModal = () => {
    this.returnEmailModal = false;
  }

  isValidEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
  updateEmail = () => {
    const emailInput = document.getElementById('email-input') as HTMLInputElement;
    if (emailInput) {
      const email = emailInput.value;
      if (this.isValidEmail(email)) {
      this.emailValid = false;

      fetch(fetchUrl + '/update-email/' + this.githubId, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
        }),
      });
    } else {
      console.error('Email input element is not found.');
      this.emailValid = true;
    }
    } else {
      console.error('Email input element is not found.');
    }
  }



  saveOptions = () => {
    const emailInput = document.getElementById('email-input-return') as HTMLInputElement;
    const passwordInput = document.getElementById('password-input-return') as HTMLInputElement;
    const messageInput = document.getElementById('return-message-input') as HTMLInputElement;
    const returnMessageYes = document.getElementById('return-message-yes') as HTMLInputElement;
    const returnMessageNo = document.getElementById('return-message-no') as HTMLInputElement;

    if (emailInput) {
      const email = emailInput.value;
      const password = passwordInput.value;
      const message = messageInput.value;
      const returnMessage = returnMessageYes.checked ? 'yes' : 'no';
      fetch(fetchUrl + '/update-return-email/' + this.githubId, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emailToReturnTo: email,
          password: password,
          message: message,
          returnMessage: returnMessage,
        }),
      });
    } else {
      console.error('Email input element is not found.');
      this.emailValid = true;
    }
  }

  ngOnInit(): void {
    if (!this.githubId) {
      return;
    }
    console.log("Github ID: ", this.githubId);
    this.fetchApiKey(this.githubId);
    this.convertToScript();

  }

  @ViewChild('script', {static: true}) script!: ElementRef;
  convertToScript() {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', "FormbeeBot");
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-auth-url', 'https://api.formbee.dev/oauth/telegram/' + this.githubId);
    script.setAttribute('data-request-access', 'write');
  }

  openTelegramModal = () => {
    this.telegramModal = !this.telegramModal;
  }

  teleLink = () => {
    window.open("https://telegram.org/");
  }

  async teleSwitch() {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    this.telegramEnabled = !this.telegramEnabled;
    if (this.telegramEnabled && this.currentPlugins !== null) {
      this.currentPlugins += 1;
    } else if (!this.telegramEnabled && this.currentPlugins !== null) {
      this.currentPlugins -= 1;
    }
    await fetch(fetchUrl + '/telegram/toogle/' + this.githubId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        telegramBoolean: this.telegramEnabled,
      }),
    });
    console.log(this.telegramEnabled);
  }

  async unlinkTelegram() {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    this.telegramChat = undefined;
    await fetch(fetchUrl + '/telegram/unlink/' + this.githubId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`

      },
    });
    console.log("Telegram unlinked");
  }

  openDiscordModal = () => {
    this.discordModal = !this.discordModal;
  }

  async discordSwitch() {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    this.discordEnabled = !this.discordEnabled;
    if (this.discordEnabled && this.currentPlugins !== null) {
      this.currentPlugins += 1;
    } else if (!this.discordEnabled && this.currentPlugins !== null) {
      this.currentPlugins -= 1;
    }
    await fetch(fetchUrl + '/discord/toogle/' + this.githubId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`

      },
      body: JSON.stringify({
        discordBoolean: this.discordEnabled,
      }),
    });
    console.log(this.discordEnabled);
  }

  async unlinkDiscord() {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    this.discordWebhook = undefined;
    await fetch(fetchUrl + '/discord/unlink/' + this.githubId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
    });
    console.log("Discord unlinked");
  }

  async saveDiscordWebhook() {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    const discordInput = document.getElementById('discord-input');
    if (discordInput) {
      this.discordWebhook = (<HTMLInputElement>discordInput).value;
      await fetch(fetchUrl + '/discord/webhook/' + this.githubId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          discordWebhook: this.discordWebhook,
        }),
      });
      console.log("Discord webhook saved");
    } else {
      console.error("'discord-input' element not found.");
    }
  }

  discordLink = () => {
    window.open("https://discord.com/");
  }

  openSlackModal = () => {
    this.slackModal = !this.slackModal;
  }

  async slackSwitch() {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    this.slackEnabled = !this.slackEnabled;
    if (this.slackEnabled && this.currentPlugins !== null) {
      this.currentPlugins += 1;
    } else if (!this.slackEnabled && this.currentPlugins !== null) {
      this.currentPlugins -= 1;
    }
    await fetch(fetchUrl + '/slack/toogle/' + this.githubId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        slackBoolean: this.slackEnabled,
      }),
    });
    console.log(this.slackEnabled);
  }

  slackLink = () => {
    window.open("https://slack.com/");
  }

  connectToSlack = () => {
    console.log("in connect to slack");
    const url = `https://slack.com/oauth/v2/authorize?client_id=7572076162737.7563846148610&scope=incoming-webhook&user_scope=channels:read,chat:write&state=${this.githubId}`;
    window.open(url);
  }

  unlinkSlack = async () => {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    this.slackChannelName = undefined;
    await fetch(fetchUrl + '/slack/unlink/' + this.githubId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
    });
    console.log("Slack unlinked");
  }

  openMakeModal = () => {
    this.makeModal = !this.makeModal;
  }

  async makeSwitch() {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    this.makeEnabled = !this.makeEnabled;
    if (this.makeEnabled && this.currentPlugins !== null) {
      this.currentPlugins += 1;
    } else if (!this.makeEnabled && this.currentPlugins !== null) {
      this.currentPlugins -= 1;
    }
    await fetch(fetchUrl + '/make/toogle/' + this.githubId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        makeBoolean: this.makeEnabled,
      }),
    });
    console.log(this.makeEnabled);
  }

  async unlinkMake() {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    this.makeWebhook = undefined;
    await fetch(fetchUrl + '/make/unlink/' + this.githubId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
    });
    console.log("Make unlinked");
  }

  async saveMakeWebhook() {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    const discordInput = document.getElementById('discord-input');
    if (discordInput) {
      this.makeWebhook = (<HTMLInputElement>discordInput).value;
      await fetch(fetchUrl + '/make/webhook/' + this.githubId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          makeWebhook: this.makeWebhook,
        }),
      });
      console.log("Make webhook saved");
    } else {
      console.error("'discord-input' element not found.");
    }
  }

  makeLink = () => {
    window.open("https://make.com/");
  }

  openN8nModal = () => {
    this.n8nModal = !this.n8nModal;
  }

  async n8nSwitch() {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    this.n8nEnabled = !this.n8nEnabled;
    if (this.n8nEnabled && this.currentPlugins !== null) {
      this.currentPlugins += 1;
    } else if (!this.n8nEnabled && this.currentPlugins !== null) {
      this.currentPlugins -= 1;
    }
    await fetch(fetchUrl + '/n8n/toogle/' + this.githubId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        n8nBoolean: this.n8nEnabled,
      }),
    });
    console.log(this.n8nEnabled);
  }

  async unlinkN8n() {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    this.n8nWebhook = undefined;
    await fetch(fetchUrl + '/n8n/unlink/' + this.githubId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
    });
    console.log("N8n unlinked");
  }

  async saveN8nWebhook() {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    const discordInput = document.getElementById('discord-input');
    if (discordInput) {
      this.n8nWebhook = (<HTMLInputElement>discordInput).value;
      await fetch(fetchUrl + '/n8n/webhook/' + this.githubId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          n8nWebhook: this.n8nWebhook,
        }),
      });
      console.log("N8n webhook saved");
    } else {
      console.error("'discord-input' element not found.");
    }
  }

  async n8nLink() {
    window.open("https://n8n.io/");
  }

  openWebhookModal = () => {
    this.webhookModal = !this.webhookModal;
  }

  async webhookSwitch() {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    this.webhookEnabled = !this.webhookEnabled;
    if (this.webhookEnabled && this.currentPlugins !== null) {
      this.currentPlugins += 1;
    } else if (!this.webhookEnabled && this.currentPlugins !== null) {
      this.currentPlugins -= 1;
    }
    await fetch(fetchUrl + '/webhook/toogle/' + this.githubId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        webhookBoolean: this.webhookEnabled,
      }),
    });
    console.log(this.webhookEnabled);
  }

  async unlinkWebhook() {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    this.webhookWebhook = undefined;
    await fetch(fetchUrl + '/webhook/unlink/' + this.githubId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
    });
    console.log("Webhook unlinked");
  }

  async saveWebhookWebhook() {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    const discordInput = document.getElementById('discord-input');
    if (discordInput) {
      this.webhookWebhook = (<HTMLInputElement>discordInput).value;
      await fetch(fetchUrl + '/webhook/webhook/' + this.githubId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          webhookWebhook: this.webhookWebhook,
        }),
      });
      console.log("Webhook webhook saved");
    } else {
      console.error("'discord-input' element not found.");
    }
  }
  async webhookLink() {
    window.open("https://whatisawebhook.com/");
  }

  discordDocs = () => {
    window.open("https://docs.formbee.dev/docs/integrations/Discord");
  }

  telegramDocs = () => {
    window.open("https://docs.formbee.dev/docs/integrations/Telegram");
  }

  n8nDocs = () => {
    window.open("https://docs.formbee.dev/docs/integrations/n8n");
  }

  makeDocs = () => {
    window.open("https://docs.formbee.dev/docs/integrations/make");
  }

  webhookDocs = () => {
    window.open("https://docs.formbee.dev/docs/integrations/Webhooks");
  }
  addDomain = () => {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    if (this.domains.length <= 50) {
      const input = document.getElementById('allowed-domains-input') as HTMLInputElement;
      if (input) {
        const domain = input.value;
        const domains2 = domain.split(',');
        if (domain) {
          fetch(fetchUrl + '/add-domain/' + this.githubId, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwtToken}`

            },
            body: JSON.stringify({
              domain: domain,
            }),
          });
          for (const domain of domains2) {
            if (!this.domains.includes(domain)) {
              this.domains.push(domain);
            }
          }
          input.value = '';
        } else {
          console.error('Domain input element is not found.');
        }
      } else {
        console.error('Domain input element is not found.');
      } 
    } else {
       alert("You can only add 50 domains");
    }
  }
  removeDomain = async (domain: string) => {
    const jwtToken = localStorage.getItem('FB_jwt_token');
    const index = this.domains.indexOf(domain);
    if (index > -1) {
      this.domains.splice(index, 1);
    }
  fetch(fetchUrl + '/remove-domain/' + this.githubId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        domain: domain,
      }),
    });
  }
}
