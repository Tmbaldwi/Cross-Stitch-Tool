import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, input, signal, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ImageService } from '../../../services/image-service';
import { CdkStepper, StepperSelectionEvent } from '@angular/cdk/stepper';
import { SplitterModule } from 'primeng/splitter';
import { ImageFrame } from "../../common/image-frame/image-frame";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { displayBitmapOnCanvas } from '../../../utility/canvas.utils';
import { concatMap, forkJoin, map, of } from 'rxjs';
import { ThreadColor } from '../../../services/models/thread-color.model';
import { ColorCard } from './color-card/color-card';
import { hexToRgb, rgbToHsl } from '../../../utility/color.utils';

@Component({
  selector: 'app-thread-selection-step',
  imports: [SplitterModule, MatButtonModule, MatIconModule, ImageFrame, ColorCard],
  templateUrl: './thread-selection-step.html',
  styleUrl: './thread-selection-step.scss',
})
export class ThreadSelectionStep implements AfterViewInit {
  readonly FetchSize : number = 5;

  @ViewChild('canvas', { static: false })
  private canvasRef!: ElementRef<HTMLCanvasElement>;
  
  readonly imageHistoryForm = input.required<FormGroup>();
  public stepper = inject(CdkStepper)
  private service = inject(ImageService)
  private cdr = inject(ChangeDetectorRef);
  private originalImageBitmap: ImageBitmap | null = null;
  private modifiedImageBitmap: ImageBitmap | null = null;

  public isLoading = signal(false);
  public errorMessage = signal<string | null>(null);
  public colorCoordinates : Map<string, number[]> | null = null;
  public threadSuggestions : Record<string, string[]> = {};
  public threadMasterList : Record<string, ThreadColor> = {};

  ngAfterViewInit() {
    this.stepper.selectionChange.subscribe((event) => {
      if (this.imageReadyForThreadSelection(event)) {
        this.onPageLoad();
      }
    });
  }

  async onPageLoad(): Promise<void> {
    const canvas = document.getElementById('thread-selection-canvas') as HTMLCanvasElement;
    this.originalImageBitmap = this.imageHistoryForm().get('normalizedImageBitmap')?.value;
    this.modifiedImageBitmap = await createImageBitmap(this.originalImageBitmap!);
    displayBitmapOnCanvas(this.modifiedImageBitmap!, canvas);
    this.loadPaletteMatches().then(() => {
      const savedThreadSelections = this.imageHistoryForm().get('threadSelections')?.value ?? {};
      for( const [original, chosen] of Object.entries(savedThreadSelections)) {
        this.swapColorOnImage(original, chosen as string);
      }
    });
  }

  imageReadyForThreadSelection(event: StepperSelectionEvent) : boolean {
    const normalizedImageControl = this.imageHistoryForm().get('normalizedImageBitmap');
    return event.selectedIndex === 3 && normalizedImageControl?.value != null;
  }

  async loadPaletteMatches() : Promise<void>{
    const threadColors$ = this.service.getThreadColorMasterList();
    const paletteProcessing$ = of(this.processImagePixels());

    forkJoin({
      threadColors: threadColors$,
      imageDetails: paletteProcessing$
    }).pipe(
      concatMap(({ threadColors, imageDetails }) => 
        this.service.getThreadColorSuggestions(Array.from(imageDetails.palette), this.FetchSize).pipe(
          map(matches => ({ threadColors, imageDetails, matches}))
        )
      )
    ).subscribe({
      next: ({ threadColors, imageDetails, matches}) => {
        this.threadMasterList = threadColors;
        this.colorCoordinates = imageDetails.pixelMap;
        this.threadSuggestions = matches;

        // Default thread selections to null
        const existing = this.imageHistoryForm().get('threadSelections')?.value ?? {};
        const initialThreadSelections : Record<string,string> = {};
        for (const color of imageDetails.palette) {
          initialThreadSelections[color] = existing[color] ?? null;
        }
        this.imageHistoryForm().get('threadSelections')?.setValue(initialThreadSelections);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Thread suggestion process failed: ", err);
      }
    })
  }

  processImagePixels() : { palette: Set<string>, pixelMap: Map<string, number[]> }{
    const palette = new Set<string>();
    const pixelMap = new Map<string, number[]>();

    const ctx = this.canvasRef.nativeElement.getContext('2d')!;
    const width = this.originalImageBitmap?.width!;
    const height = this.originalImageBitmap?.height!;

    const imageData = ctx.getImageData(0,0, width, height)
    const pixels = imageData.data;

    for(let i = 0; i < pixels.length; i += 4){
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      // Add color to palette
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      palette.add(hex);
           
      // Add color coordinate to lookup guide
      if (!pixelMap.has(hex)) {
        pixelMap.set(hex, []);
      }

      pixelMap.get(hex)!.push(i);
    }

    return {
      palette: palette,
      pixelMap: pixelMap
    };
  }

  getColorSwapFn(originalColor: string){
    return (newColor: string) => this.swapColorOnImage(originalColor, newColor);
  }

  swapColorOnImage(originalHex: string, newHex: string) : void {
    const originalHexCoordinates : number[] | undefined = this.colorCoordinates?.get(originalHex);

    if(originalHexCoordinates === undefined){
      console.error(`Could not find coordinates for ${originalHex}`);
      return;
    }

    const ctx = this.canvasRef.nativeElement.getContext('2d')!;
    const width = this.originalImageBitmap?.width!;
    const height = this.originalImageBitmap?.height!;

    const imageData = ctx.getImageData(0,0, width, height)
    const pixels = imageData.data;

    const r = parseInt(newHex.slice(1, 3), 16);
    const g = parseInt(newHex.slice(3, 5), 16);
    const b = parseInt(newHex.slice(5, 7), 16);

    for(let idx of originalHexCoordinates){
      pixels[idx] = r;
      pixels[idx+1] = g;
      pixels[idx+2] = b;
    }

    ctx.putImageData(imageData, 0, 0);

    // Track selection
    const threadSelectionRecords = this.imageHistoryForm().get('threadSelections');
    threadSelectionRecords?.setValue({
      ...threadSelectionRecords.value,
      [originalHex]: newHex
    });
  }

  get paletteColors(): string[] {
    const hexColors: string[] = Object.keys(this.imageHistoryForm().get('threadSelections')?.value ?? {});

    // Hs1 sorting, sorts by rainbow
    return [...hexColors].sort((a,b) => {
      const hs1A = rgbToHsl(hexToRgb(a));
      const hs1B = rgbToHsl(hexToRgb(b));
      return hs1A.h - hs1B.h;
    })
  }
}
