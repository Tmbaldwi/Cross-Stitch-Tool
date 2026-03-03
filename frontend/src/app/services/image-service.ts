import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from './../../../environments/environment';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
import { ImageRescaleResponse } from './models/image-rescale-response.model';
import { ImageColorNormalizeResponse } from './models/image-color-normalize-response.model';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private http = inject(HttpClient)
  private baseUrl = environment.apiBaseUrl;

  getRescaledImage(image: File) : Observable<ImageRescaleResponse>{
    if(!image){
      console.error('No image file was provided');
      return throwError(() => new Error('No file provided'));
    };

    const formData = new FormData();
    formData.append('image_file', image, image.name);

    return this.http.post(
      `${this.baseUrl}/api/image/rescale-image`, 
      formData,
      {
        responseType: 'blob',
        observe: 'response'
      }
      ).pipe(
          switchMap(response => {
            const blob = response.body as Blob;

            const oldWidth = Number(response.headers.get('old-width'));
            const oldHeight = Number(response.headers.get('old-height'));

            return from(createImageBitmap(blob)).pipe(
              map(bitmap => ({
                oldWidth: oldWidth,
                oldHeight: oldHeight,
                scaledImageBitmap: bitmap
              }))
            );
          }),
          catchError(err => {
            console.error('Resize failed:', err);
            return throwError(() => err as Error);
          })
        )
  }

  getColorNormalizedImage(imageBlob: Blob) : Observable<ImageColorNormalizeResponse>{
    if(!imageBlob){
      console.error('No image blob was provided');
      return throwError(() => new Error('No image blob was provided'));
    };

    // Create API call
    const formData = new FormData();
    formData.append('image_file', imageBlob, "scaledImage.png");

    return this.http.post(
      `${this.baseUrl}/api/image/color-normalize-image`,
      formData,
      {
        responseType: 'blob',
        observe: 'response'
      }
      ).pipe(
          switchMap(response => {
            const blob = response.body as Blob;

            const oldColorCount = Number(response.headers.get('old-color-count'));
            const newColorCount = Number(response.headers.get('new-color-count'));

            return from(createImageBitmap(blob)).pipe(
              map(bitmap => ({
                oldColorCount: oldColorCount,
                newColorCount: newColorCount,
                normalizedImageBitmap: bitmap
              }))
            );
          }),
          catchError(err => {
            console.error('Resize failed:', err);
            return throwError(() => err as Error);
          })
        )
  }
}
