import { CdkStepper, StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, EventEmitter, inject, input, signal } from '@angular/core';
import { ImageAnalysis, ImageService } from '../../../services/image-service';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-image-scaling-step',
  imports: [MatButtonModule, MatStepperModule, MatButtonModule, MatIconModule],
  templateUrl: './image-scaling-step.html',
  styleUrl: './image-scaling-step.scss',
})
export class ImageScalingStep {
  readonly imageHistoryForm = input.required<FormGroup>();

  private stepper = inject(CdkStepper);
  private service = inject(ImageService);
  public imageRescaleResponse : ImageAnalysis | undefined = undefined;
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
    const scaledImageControl = this.imageHistoryForm().get('scaledImageBase64');
    return event.selectedIndex === 1 && scaledImageControl?.value === null
  }

  isNextButtonDisabled(){
    return this.imageHistoryForm().get('scaledImageBase64')?.invalid;
  }

  onStepBegin() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.getRescaledImage();
  }

  async getRescaledImage(){
    try {
      this.imageRescaleResponse = await firstValueFrom(
        this.service.getRescaledImage()
      );

    this.imageHistoryForm().get('scaledImageBase64')?.setValue(this.imageRescaleResponse.image_base64);

    }
    catch (error: unknown){
      if (error instanceof HttpErrorResponse) {
        this.errorMessage.set(
          error.error?.detail ||
          error.message || 
          'Server error occurred'
        );
      } else if(error instanceof Error){
        this.errorMessage.set("Error occurred: " + error.message);
      } else{
        this.errorMessage.set("An unknown error occurred. Please try again.");
      }
      
    }
    finally {
      this.isLoading.set(false);
    }
  }
}
