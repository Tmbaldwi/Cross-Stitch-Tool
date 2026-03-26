import { Component, ElementRef, inject, input, signal, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ImageService } from '../../../services/image-service';
import { CdkStepper } from '@angular/cdk/stepper';
import { SplitterModule } from 'primeng/splitter';
import { ImageFrame } from "../../common/image-frame/image-frame";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-thread-selection-step',
  imports: [SplitterModule, MatButtonModule, MatIconModule, ImageFrame],
  templateUrl: './thread-selection-step.html',
  styleUrl: './thread-selection-step.scss',
})
export class ThreadSelectionStep {
  @ViewChild('canvas', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;
  
  readonly imageHistoryForm = input.required<FormGroup>();
  private stepper = inject(CdkStepper)
  private service = inject(ImageService)

  public isLoading = signal(false);
  public errorMessage = signal<string | null>(null);
}
