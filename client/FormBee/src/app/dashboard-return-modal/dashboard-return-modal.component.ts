import { Component, output } from '@angular/core';
import { ElementRef } from '@angular/core';
import { OnInit } from '@angular/core';
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

  ngOnInit(): void {
    this.setSwitch();
  }

  constructor(elRef: ElementRef<HTMLElement>) {
    this.elRef = elRef;
  }

  returnEmailModal = output<boolean>();
  

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
    this.switch = modalSwitch.checked;
    console.log(this.switch);
  }

  setSwitch() {
    const modalSwitch = document.getElementById('toggleSwitch') as HTMLInputElement;
    modalSwitch.checked = this.switch;
    console.log(this.switch);
  }
}
