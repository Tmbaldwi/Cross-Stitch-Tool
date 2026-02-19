import { CdkStepper } from '@angular/cdk/stepper';
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ImageDimensions, ImageService } from '../../../services/image-service';
import { firstValueFrom, from, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';

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
  public imageAnalysis : ImageDimensions | undefined = undefined;
  public isLoading = signal(false);

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

    try {
      this.imageAnalysis = await firstValueFrom(
        this.service.getScaledDownSizeForImage()
      );

      const canvas = await this.processPixelArt(
        this.service.originalFile()!,
        this.imageAnalysis.new_width,
        this.imageAnalysis.new_height,
        this.getMedianWeighted
      );

      this.drawCanvas(canvas);
    }
    finally {
      this.isLoading.set(false);
    }
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
    targetHeight: number,
    resizeFunction: ( fullPixel: ImageData ) => ImageData
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
    const yStep = bitmap.height / targetHeight;

    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const srcX = Math.floor(x * xStep);
        const srcY = Math.floor(y * yStep);

        const pixel = srcCtx.getImageData(srcX, srcY, xStep, yStep);
        const newPixel = resizeFunction(pixel);
        dstCtx.putImageData(newPixel, x, y);
      }
    }

    return dstCanvas;
  }


  async resizeImage(
    file: File,
    targetWidth: number,
    targetHeight: number
  ): Promise<HTMLCanvasElement> {
    const bitmap = await createImageBitmap(file);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false; // IMPORTANT for pixel art

    ctx.drawImage(
      bitmap,
      0, 0, bitmap.width, bitmap.height,
      0, 0, targetWidth, targetHeight
    );

    return canvas;
  }

  getAverageColor(fullPixel: ImageData){
    const { width, height, data } = fullPixel;

    let rAverage = 0;
    let gAverage = 0;
    let bAverage = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        rAverage += r;
        gAverage += g;
        bAverage += b;
      }
    }

    let totalPixels = width*height;
    rAverage = Math.round(rAverage/totalPixels);
    gAverage = Math.round(gAverage/totalPixels);
    bAverage = Math.round(bAverage/totalPixels);

    const averagePixel = new ImageData(1,1);
    averagePixel.data[0] = rAverage;
    averagePixel.data[1] = gAverage;
    averagePixel.data[2] = bAverage;
    averagePixel.data[3] = data[3];

    return averagePixel;
  }

  getMedianColor(fullPixel: ImageData){
    const { width, height, data } = fullPixel;
    const colorCount = new Map<string, number>();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Ignore transparent / blended pixels
        if (a < 200) continue;

        const key = `${r},${g},${b}`;
        colorCount.set(key, (colorCount.get(key) ?? 0) + 1);
      }
    }

    let bestColor = '0,0,0';
    let bestCount = -1;

    for (const [color, count] of colorCount) {
      if (count > bestCount) {
        bestColor = color;
        bestCount = count;
      }
    }

    const [r, g, b] = bestColor.split(',').map(Number);
    const averagePixel = new ImageData(1,1);
    averagePixel.data[0] = r;
    averagePixel.data[1] = g;
    averagePixel.data[2] = b;
    averagePixel.data[3] = 255;

    return averagePixel;
  }

  getMedianWeighted(fullPixel: ImageData){
    const { width, height, data } = fullPixel;
    const colorCount = new Map<string, number>();
    const centerX = width/2;
    const centerY = height/2;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Add weight based on distance from center
        const distanceX = Math.abs(x - centerX)
        const distanceY = Math.abs(y - centerY);
        const weight = 1 / (1 + (distanceX + distanceY)^2);

        const key = `${r},${g},${b}`;
        colorCount.set(key, (colorCount.get(key) ?? 0) + weight);
      }
    }

    let bestColor = '0,0,0';
    let bestCount = -1;

    for (const [color, count] of colorCount) {
      if (count > bestCount) {
        bestColor = color;
        bestCount = count;
      }
    }

    const [r, g, b] = bestColor.split(',').map(Number);
    const averagePixel = new ImageData(1,1);
    averagePixel.data[0] = r;
    averagePixel.data[1] = g;
    averagePixel.data[2] = b;
    averagePixel.data[3] = 255;

    return averagePixel;
  }
}
