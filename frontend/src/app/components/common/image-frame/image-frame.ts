import { Component, input } from '@angular/core';

@Component({
  selector: 'app-image-frame',
  templateUrl: './image-frame.html',
  styleUrl: './image-frame.scss',
  standalone: true,
})
export class ImageFrame {
  errorMessage = input<string | null>(null)
  isLoading = input<boolean>(false);
}