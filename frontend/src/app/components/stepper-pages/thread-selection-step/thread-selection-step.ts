import { AfterViewInit, Component, ElementRef, inject, input, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ImageService } from '../../../services/image-service';
import { CdkStepper, StepperSelectionEvent } from '@angular/cdk/stepper';
import { SplitterModule } from 'primeng/splitter';
import { ImageFrame } from "../../common/image-frame/image-frame";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { displayBitmapOnCanvas } from '../../../utility/canvas.utils';
import { concatMap, forkJoin, map, of } from 'rxjs';

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
    this.loadData();
  }

  imageReadyForThreadSelection(event: StepperSelectionEvent) : boolean {
    const normalizedImageControl = this.imageHistoryForm().get('normalizedImageBitmap');
    return event.selectedIndex === 3 && normalizedImageControl?.value != null;
  }

  loadData(){ // TODO name change
    const threadColors$ = this.service.getThreadColorMasterList();
    const paletteProcessing$ = of(this.getColorPaletteFromImage());

    forkJoin({
      threadColors: threadColors$,
      palette: paletteProcessing$
    }).pipe(
      concatMap(({ threadColors, palette}) => 
        this.service.getThreadColorSuggestions(palette).pipe(
          map(matches => ({ threadColors, palette, matches}))
        )
      )
    ).subscribe({
      next: ({ threadColors, palette, matches}) => {
        console.log(threadColors) // TODO actually load these
        console.log(palette)
        console.log(matches)
      },
      error: (err) => {
        // TODO
      }
    })
  }

  getColorPaletteFromImage(){
    const palette = new Set<string>();

    const ctx = this.canvasRef.nativeElement.getContext('2d')!;
    const imageData = ctx.getImageData(0,0, this.originalImageBitmap?.width!, this.originalImageBitmap?.height!)
    const pixels = imageData.data;

    for(let i = 0; i < pixels.length; i += 4){
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      palette.add(hex);
    }

    return palette;
  }
}
