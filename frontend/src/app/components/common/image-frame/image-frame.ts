import { Component, input } from '@angular/core';
import { FileDragAndDrop } from "../../../directives/file-drag-and-drop/file-drag-and-drop";
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-image-frame',
  templateUrl: './image-frame.html',
  styleUrl: './image-frame.scss',
  standalone: true,
  imports: [FileDragAndDrop, NgTemplateOutlet],
})
export class ImageFrame {
  errorMessage = input<string | null>(null)
  isLoading = input<boolean>(false);
  isDragDropEnabled = input<boolean>(false);
  showTextbox = input<boolean>(false);
  customBorder = input<string | null>(null);
  showTextBox = input<boolean>(false);
}