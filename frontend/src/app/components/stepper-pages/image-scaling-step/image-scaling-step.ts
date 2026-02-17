import { CdkStepper } from '@angular/cdk/stepper';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { ImageDimensions, ImageService } from '../../../services/image-service';

@Component({
  selector: 'app-image-scaling-step',
  imports: [],
  templateUrl: './image-scaling-step.html',
  styleUrl: './image-scaling-step.scss',
})
export class ImageScalingStep {

  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  private stepper = inject(CdkStepper);
  private service = inject(ImageService);

  private settings: ImageDimensions | null = null;

  ngOnInit(){
    this.stepper.selectionChange
      .subscribe(e => {
        if(e.selectedIndex === 1){
          this.onActivated();
        }
      })
  }

  onActivated(){
    this.service.getScaledDownSizeForImage().subscribe((res) => { console.log(res); this.settings = res });
  }

  async onClick(){
    const canvas = await this.processPixelArt(this.service.originalFile()!, this.settings!.new_width, this.settings!.new_height)
    this.drawCanvas(canvas);
  }

  private drawCanvas(source: HTMLCanvasElement) {
    const target = this.canvas.nativeElement;
    const ctx = target.getContext('2d')!;
    
    // Match resolution
    target.width = source.width;
    target.height = source.height;

    // Pixel-art rules
    ctx.imageSmoothingEnabled = false;

    // Clear + draw
    ctx.clearRect(0, 0, target.width, target.height);
    ctx.drawImage(source, 0, 0);
  }

  async processPixelArt(
    file: File,
    targetWidth: number,
    targetHeight: number
  ): Promise<HTMLCanvasElement> {
    // Decode the file
    const bitmap = await createImageBitmap(file);

    // Draw original image to a source canvas
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = bitmap.width;
    srcCanvas.height = bitmap.height;

    const srcCtx = srcCanvas.getContext('2d')!;
    srcCtx.drawImage(bitmap, 0, 0);

    // Create target canvas (downscaled pixel grid)
    const dstCanvas = document.createElement('canvas');
    dstCanvas.width = targetWidth;
    dstCanvas.height = targetHeight;

    const dstCtx = dstCanvas.getContext('2d')!;
    dstCtx.imageSmoothingEnabled = false;

    // Pixel-art downscale (nearest-neighbor sampling)
    const xStep = bitmap.width / targetWidth;
    const xStepOffset = xStep/2;
    const yStep = bitmap.height / targetHeight;
    const yStepOffset = yStep/2;

    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const srcX = Math.floor(x * xStep + xStepOffset);
        const srcY = Math.floor(y * yStep + yStepOffset);

        const pixel = srcCtx.getImageData(srcX, srcY, 1, 1);
        dstCtx.putImageData(pixel, x, y);
      }
    }

    return dstCanvas;
  }
}
