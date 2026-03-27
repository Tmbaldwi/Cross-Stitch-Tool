import { AfterViewInit, Component, ElementRef, inject, input, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ImageService } from '../../../services/image-service';
import { CdkStepper, StepperSelectionEvent } from '@angular/cdk/stepper';
import { SplitterModule } from 'primeng/splitter';
import { ImageFrame } from "../../common/image-frame/image-frame";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { displayBitmapOnCanvas } from '../../../utility/canvas.utils';

@Component({
  selector: 'app-thread-selection-step',
  imports: [SplitterModule, MatButtonModule, MatIconModule, ImageFrame],
  templateUrl: './thread-selection-step.html',
  styleUrl: './thread-selection-step.scss',
})
export class ThreadSelectionStep implements AfterViewInit {
  @ViewChild('canvas', { static: false })
  private canvasRef!: ElementRef<HTMLCanvasElement>;
  
  readonly imageHistoryForm = input.required<FormGroup>();
  public stepper = inject(CdkStepper)
  private service = inject(ImageService)
  private originalImageBitmap: ImageBitmap | null = null;

  public isLoading = signal(false);
  public errorMessage = signal<string | null>(null);

  ngAfterViewInit() {
    this.stepper.selectionChange.subscribe((event) => {
      if (this.imageReadyForThreadSelection(event)) {
        this.onPageLoad();
      }
    });
  }

  onPageLoad(): void {
    const canvas = document.getElementById('thread-selection-canvas') as HTMLCanvasElement;
    this.originalImageBitmap = this.imageHistoryForm().get('normalizedImageBitmap')?.value;
    displayBitmapOnCanvas(this.originalImageBitmap!, canvas);
  }

  imageReadyForThreadSelection(event: StepperSelectionEvent) : boolean {
    const normalizedImageControl = this.imageHistoryForm().get('normalizedImageBitmap');
    return event.selectedIndex === 3 && normalizedImageControl?.value != null;
  }
}
