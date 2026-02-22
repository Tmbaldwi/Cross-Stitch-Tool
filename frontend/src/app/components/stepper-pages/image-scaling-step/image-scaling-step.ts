import { CdkStepper } from '@angular/cdk/stepper';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { ImageAnalysis, ImageService } from '../../../services/image-service';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-image-scaling-step',
  imports: [MatButtonModule, MatStepperModule, MatButtonModule, MatIconModule],
  templateUrl: './image-scaling-step.html',
  styleUrl: './image-scaling-step.scss',
})
export class ImageScalingStep {
  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  private stepper = inject(CdkStepper);
  private service = inject(ImageService);
  public imageAnalysis : ImageAnalysis | undefined = undefined;
  public isLoading = signal(false);
  public errorMessage = signal<string | null>(null);

  ngOnInit(){
    this.stepper.selectionChange
      .subscribe(e => {
        if(e.selectedIndex === 1 && this.service.originalFileProcessed() == false){
          this.onActivated();
        }
      })
  }

  nextButtonDisabled(){
    return !this.service.originalFileProcessed();
  }

  async onActivated() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.imageAnalysis = await firstValueFrom(
        this.service.getRescaledImage()
      );
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
