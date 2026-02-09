import { Component } from '@angular/core';

@Component({
  selector: 'app-upload-step',
  imports: [],
  templateUrl: './upload-step.html',
  styleUrl: './upload-step.scss',
})
export class UploadStep {
  sampleImages = [
    { id: 1, imageUrl: "https://picsum.photos/id/237/500/300"},
    { id: 2, imageUrl: "https://picsum.photos/600/300"},
    { id: 3, imageUrl: "https://picsum.photos/500/400"}
  ]

  file: File | null = null;
}
