import { CdkStepper } from '@angular/cdk/stepper';
import { Component, ElementRef, inject, input, signal, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ImageService } from '../../../services/image-service';
import { ImageFrame } from "../../common/image-frame/image-frame";
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { ImageColorNormalizeResponse } from '../../../services/models/image-color-normalize-response.model';
import { HttpErrorResponse } from '@angular/common/http';
import { clearCanvas, displayBitmapOnCanvas } from '../../../utility/canvas.utils';

@Component({
  selector: 'app-image-normalization-step',
  imports: [MatButtonModule, MatStepperModule, MatButtonModule, MatIconModule, ImageFrame],
  templateUrl: './image-normalization-step.html',
  styleUrl: './image-normalization-step.scss',
})
export class ImageNormalizationStep {
  @ViewChild('canvas', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;
  
  readonly imageHistoryForm = input.required<FormGroup>();
  private stepper = inject(CdkStepper)
  private service = inject(ImageService)

  public imageColorNormalize: ImageColorNormalizeResponse | undefined = undefined;
  public isLoading = signal(false);
  public errorMessage = signal<string | null>(null);

  ngOnInit(){
    this.stepper.selectionChange.subscribe((event) =>{
      if(event.selectedIndex === 2){
        this.onStepBegin();
      }
    })
  }

  onStepBegin() {
    this.imageColorNormalize = undefined;
    clearCanvas(this.canvasRef.nativeElement);
    
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.getColorNormalizedImage();
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

    this.service.getColorNormalizedImage(imageBlob).subscribe({
      next: (res) => {
        this.imageColorNormalize = res;

        this.imageHistoryForm().get('normalizedImageBitmap')?.setValue(res.normalizedImageBitmap);

        displayBitmapOnCanvas(res.normalizedImageBitmap, this.canvasRef.nativeElement);
      },

      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          this.errorMessage.set(
            error.error?.detail ||
            error.message ||
            'Server error occurred'
          );
        } else if (error instanceof Error) {
          this.errorMessage.set('Error occurred: ' + error.message);
        } else {
          this.errorMessage.set(
            'An unknown error occurred. Please try again.'
          );
        }

        this.isLoading.set(false);
      },

      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
  
  isNextButtonDisabled(){
    return this.imageHistoryForm().get('normalizedImageBitmap')?.invalid;
  }
}
