import { Component, input, output } from '@angular/core';
import { ElementRef } from '@angular/core';
import { OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { fetchUrl } from '../global-vars';
@Component({
  selector: 'app-dashboard-return-modal',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-return-modal.component.html',
  styleUrl: './dashboard-return-modal.component.scss'
})
export class DashboardReturnModalComponent implements OnInit {
  elRef: ElementRef<HTMLElement>;
  switch: boolean = false;

  @Input() smtpHost: string | undefined;
  @Input() smtpPort: number | undefined;
  @Input() smtpUsername: string | undefined;
  @Input() smtpPassword: string | undefined;
  @Input() emailSubject: string | undefined;
  @Input() emailBody: string | undefined;
  @Input() returnEmailBoolean: boolean = false;
  @Input() githubId: string | undefined;
  @Input() subscriptionTier: string | undefined;

  ngOnInit(): void {
    this.setSwitch();
    console.log(this.smtpHost, this.smtpPort, this.smtpUsername, this.smtpPassword, this.emailSubject, this.emailBody, this.returnEmailBoolean);
  }

  constructor(elRef: ElementRef<HTMLElement>) {
    this.elRef = elRef;
  }

  returnEmailModal = output<boolean>();
  smtpHostOutput = output<string | undefined>();
  smtpPortOutput = output<number>();
  smtpUsernameOutput = output<string>();
  smtpPasswordOutput = output<string>();
  emailSubjectOutput = output<string>();
  emailBodyOutput = output<string>();
  returnEmailBooleanOutput = output<boolean>();
  googleEmailOutput = output<string | undefined>();
  
  closeModal = () => {
    const modalElement = this.elRef.nativeElement.querySelector('.modal');
    const modalContainerElement = this.elRef.nativeElement.querySelector('.modal-container');
    if (modalElement && modalContainerElement) {
      modalElement.classList.remove('fadeIn');
      modalElement.classList.add('scale-out-center');
      modalContainerElement.classList.add('scale-out-center');

      setTimeout(() => {
        this.returnEmailModal.emit(false);
      }, 500); // Wait for the animation to finish
    }
  }
  toggleSwitch() {
    const modalSwitch = document.getElementById('toggleSwitch') as HTMLInputElement;
    this.returnEmailBoolean = modalSwitch.checked;
    console.log(this.returnEmailBoolean);
  }

  setSwitch() {
    const modalSwitch = document.getElementById('toggleSwitch') as HTMLInputElement;
    modalSwitch.checked = this.returnEmailBoolean;
    console.log(this.returnEmailBoolean);
  }

  saveChanges = async () => {
    const smtpHost = document.getElementById('smtp-host-input-host') as HTMLInputElement;
    const smtpPort = document.getElementById('smtp-port-input-port') as HTMLInputElement;
    const smtpUsername = document.getElementById('smtp-username-input-username') as HTMLInputElement;
    const smtpPassword = document.getElementById('smtp-password-input-password') as HTMLInputElement;
    const emailSubject = document.getElementById('email-subject-input-subject') as HTMLInputElement;
    const emailBody = document.getElementById('email-body-input-body') as HTMLInputElement;
    this.smtpHost = smtpHost.value;
    this.smtpPort = parseInt(smtpPort.value, 10);
    this.smtpUsername = smtpUsername.value;
    this.smtpPassword = smtpPassword.value;
    this.emailSubject = emailSubject.value;
    this.emailBody = emailBody.value;
  
    this.smtpHostOutput.emit(this.smtpHost);
    this.smtpPortOutput.emit(this.smtpPort);
    this.smtpUsernameOutput.emit(this.smtpUsername);
    this.smtpPasswordOutput.emit(this.smtpPassword);
    this.emailSubjectOutput.emit(this.emailSubject);
    this.emailBodyOutput.emit(this.emailBody);
    this.returnEmailBooleanOutput.emit(this.returnEmailBoolean);
    await fetch(fetchUrl +'/update-return-settings/' + this.githubId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        smtpHost: this.smtpHost,
        smtpPort: this.smtpPort,
        smtpUsername: this.smtpUsername,
        smtpPassword: this.smtpPassword,
        emailSubject: this.emailSubject,
        emailBody: this.emailBody,
        returnMessage: this.returnEmailBoolean,
      }),
    }).then(() => {
      if (this.smtpHost && this.smtpPort && this.smtpUsername && this.smtpPassword && this.emailSubject && this.emailBody) {
        this.googleEmailOutput.emit(this.smtpUsername);
      }
    }).then(this.closeModal);
    console.log("Save changes");
  }
}