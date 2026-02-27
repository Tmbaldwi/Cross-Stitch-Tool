import { CdkStepper } from '@angular/cdk/stepper';
import { Component, inject, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ImageService } from '../../../services/image-service';

@Component({
  selector: 'app-image-normalization-step',
  imports: [],
  templateUrl: './image-normalization-step.html',
  styleUrl: './image-normalization-step.scss',
})
export class ImageNormalizationStep {
  readonly imageHistoryForm = input.required<FormGroup>();
  stepper = inject(CdkStepper)
  service = inject(ImageService)

  ngOnInit(){
    this.stepper.selectionChange.subscribe((event) =>{
      if(event.selectedIndex === 2){
        this.getColorNormalizedImage();
      }
    })
  }

  async getColorNormalizedImage(){
    const imageBitmap: ImageBitmap = this.imageHistoryForm().get('scaledImageBitmap')?.value;

    // Convert bitmap to blob
    const imageCanvas = document.createElement('canvas');
    imageCanvas.width = imageBitmap.width;
    imageCanvas.height = imageBitmap.height;

    const ctx = imageCanvas.getContext('2d')!;
    ctx.drawImage(imageBitmap, 0, 0);

    const imageBlob: Blob = await new Promise<Blob>((resolve) => imageCanvas.toBlob(blob => resolve(blob!), 'image/png'));

    this.service.getColorNormalizedImage(imageBlob).subscribe(res => {
      console.log(res)
    })
  }

}
