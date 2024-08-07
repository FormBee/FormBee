import { Component, output } from '@angular/core';
import { ElementRef } from '@angular/core';
@Component({
  selector: 'app-dashboard-return-modal',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-return-modal.component.html',
  styleUrl: './dashboard-return-modal.component.scss'
})
export class DashboardReturnModalComponent {
  elRef: ElementRef<HTMLElement>;

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
}
