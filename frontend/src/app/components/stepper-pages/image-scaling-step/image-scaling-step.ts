import { CdkStepper, StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, ElementRef, inject, input, signal, ViewChild } from '@angular/core';
import { ImageService } from '../../../services/image-service';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { FormGroup } from '@angular/forms';
import { ImageRescaleResponse } from '../../../services/models/image-rescale-response.model';
import { ImageFrame } from "../../common/image-frame/image-frame";
import { clearCanvas, displayBitmapOnCanvas } from '../../../utility/canvas.utils';
import { catchError, EMPTY, Subject, switchMap, take, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private rescaleImage$ = new Subject<void>();

  public imageRescale : ImageRescaleResponse | undefined = undefined;
  public isLoading = signal(false);
  public errorMessage = signal<string | null>(null);

  constructor(){
    this.rescaleImage$.pipe(
      takeUntilDestroyed(),
      tap(() => {
        this.isLoading.set(true);
        this.errorMessage.set(null);
      }),
      switchMap(() => 
        this.service.getRescaledImage(this.imageHistoryForm().get('originalImage')?.value).pipe(
          take(1),
          catchError(err => {
            this.errorMessage.set("Something went wrong, please try again");
            console.error(err);

            this.isLoading.set(false);
            return EMPTY;
          })
        ) 
      )
    ).subscribe({
      next: (res) => {
        this.imageRescale = res;
        this.imageHistoryForm().get('scaledImageBitmap')?.setValue(res.scaledImageBitmap);
        displayBitmapOnCanvas(res.scaledImageBitmap, this.canvasRef.nativeElement);

        this.isLoading.set(false);
      },
    })
  }

  ngOnInit(){
    this.stepper.selectionChange
      .subscribe(e => {
        if(this.imageNeedsRescaling(e)){
          this.rescaleOriginalImage();
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

  rescaleOriginalImage() {
    this.imageRescale = undefined;
    clearCanvas(this.canvasRef.nativeElement);

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.rescaleImage$.next();
  }
}
