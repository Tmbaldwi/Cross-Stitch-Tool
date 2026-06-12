import { Component, input, output } from '@angular/core';
import { FileDragAndDrop } from "../../../directives/file-drag-and-drop/file-drag-and-drop";
import { NgTemplateOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-image-frame',
  templateUrl: './image-frame.html',
  styleUrl: './image-frame.scss',
  standalone: true,
  imports: [FileDragAndDrop, NgTemplateOutlet, MatButtonModule, MatStepperModule, MatButtonModule, MatIconModule],
})
export class ImageFrame {
  errorMessage = input<string | null>(null)
  isLoading = input<boolean>(false);
  isDragDropEnabled = input<boolean>(false);
  showTextbox = input<boolean>(false);
  customBorder = input<string | null>(null);
  showTextBox = input<boolean>(false);

  showRetry = input(false);
  retryClicked = output<void>();

  onRetry(){
    this.retryClicked.emit();
  }
}