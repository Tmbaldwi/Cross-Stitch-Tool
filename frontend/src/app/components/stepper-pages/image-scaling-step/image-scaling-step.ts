import { CdkStepper, StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, ElementRef, inject, input, signal, ViewChild } from '@angular/core';
import { ImageService } from '../../../services/image-service';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { ImageRescaleResponse } from '../../../services/models/image-rescale-response.model';
import { ImageFrame } from "../../common/image-frame/image-frame";
import { clearCanvas, displayBitmapOnCanvas } from '../../../utility/canvas.utils';

@Component({
  selector: 'app-image-scaling-step',
  imports: [MatButtonModule, MatStepperModule, MatButtonModule, MatIconModule, ImageFrame],
  templateUrl: './image-scaling-step.html',
  styleUrl: './image-scaling-step.scss',
})
export class ImageScalingStep {
  @ViewChild('canvas', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly imageHistoryForm = input.required<FormGroup>();

  private stepper = inject(CdkStepper);
  private service = inject(ImageService);

  public imageRescale : ImageRescaleResponse | undefined = undefined;
  public isLoading = signal(false);
  public errorMessage = signal<string | null>(null);

  ngOnInit(){
    this.stepper.selectionChange
      .subscribe(e => {
        if(this.imageNeedsRescaling(e)){
          this.onStepBegin();
        }
      })
  }

  imageNeedsRescaling(event: StepperSelectionEvent){
    const scaledImageControl = this.imageHistoryForm().get('scaledImageBitmap');
    return event.selectedIndex === 1 && scaledImageControl?.value === null
  }

  isNextButtonDisabled(){
    return this.imageHistoryForm().get('scaledImageBitmap')?.invalid;
  }

  onStepBegin() {
    this.imageRescale = undefined;
    clearCanvas(this.canvasRef.nativeElement);

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.getRescaledImage();
  }

  getRescaledImage() {
    const originalImage: File = this.imageHistoryForm().get('originalImage')?.value;

    this.service.getRescaledImage(originalImage).subscribe({
      next: (res) => {
        this.imageRescale = res;

        this.imageHistoryForm().get('scaledImageBitmap')?.setValue(res.scaledImageBitmap);

        displayBitmapOnCanvas(res.scaledImageBitmap, this.canvasRef.nativeElement);
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
}
