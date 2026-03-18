import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-confirm-modal.component.html',
  styleUrls: ['./delete-confirm-modal.component.css']
})
export class DeleteConfirmModalComponent {
  @Input() productName = '';
  @Output() confirmed = new EventEmitter<boolean>();

  cancel(): void {
    this.confirmed.emit(false);
  }

  confirm(): void {
    this.confirmed.emit(true);
  }
}
