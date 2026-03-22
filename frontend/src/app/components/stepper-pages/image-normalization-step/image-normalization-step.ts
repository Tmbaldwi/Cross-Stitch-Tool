import { CdkStepper, StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, ElementRef, inject, input, signal, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ImageService } from '../../../services/image-service';
import { ImageFrame } from "../../common/image-frame/image-frame";
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { ImageColorNormalizeResponse } from '../../../services/models/image-color-normalize-response.model';
import { clearCanvas, displayBitmapOnCanvas } from '../../../utility/canvas.utils';
import { catchError, EMPTY, from, Subject, switchMap, take, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private colorNormalizeImage$ = new Subject<void>();

  public imageColorNormalize: ImageColorNormalizeResponse | undefined = undefined;
  public isLoading = signal(false);
  public errorMessage = signal<string | null>(null);

  constructor() {
    this.colorNormalizeImage$.pipe(
      takeUntilDestroyed(),
      tap(() => {
        this.isLoading.set(true);
        this.errorMessage.set(null);
      }),
      switchMap(() => 
        from(this.getScaledImageBlob()).pipe(
          switchMap(blob => 
            this.service.getColorNormalizedImage(blob).pipe(
              take(1),
              catchError(err => {
                this.errorMessage.set("Something went wrong, please try again");
                console.error(err);

                this.isLoading.set(false);
                return EMPTY;
              })
            ) 
          )
        )
      )
    ).subscribe({
      next: (res) => {
        this.imageColorNormalize = res;
        this.imageHistoryForm().get('normalizedImageBitmap')?.setValue(res.normalizedImageBitmap);
        displayBitmapOnCanvas(res.normalizedImageBitmap, this.canvasRef.nativeElement);

        this.isLoading.set(false);
      },
    })
  }

  ngOnInit(){
    this.stepper.selectionChange.subscribe((event) =>{
      if(this.imageNeedsNormalization(event)){
        this.colorNormalizeImage();
      }
    })
  }

  imageNeedsNormalization(event: StepperSelectionEvent){
    const normalizedImageControl = this.imageHistoryForm().get('normalizedImageBitmap');
    return event.selectedIndex === 2 && normalizedImageControl?.value === null
  }

  colorNormalizeImage() {
      this.imageColorNormalize = undefined;
      clearCanvas(this.canvasRef.nativeElement);
      this.colorNormalizeImage$.next();
  }

  async getScaledImageBlob() : Promise<Blob> {
    const imageBitmap: ImageBitmap = this.imageHistoryForm().get('scaledImageBitmap')?.value;

    // Convert bitmap to blob
    const imageCanvas = document.createElement('canvas');
    imageCanvas.width = imageBitmap.width;
    imageCanvas.height = imageBitmap.height;

    const ctx = imageCanvas.getContext('2d')!;
    ctx.drawImage(imageBitmap, 0, 0);

    return await new Promise<Blob>((resolve) => imageCanvas.toBlob(blob => resolve(blob!), 'image/png'));
  }
  
  isNextButtonDisabled(){
    return this.imageHistoryForm().get('normalizedImageBitmap')?.invalid;
  }
}
