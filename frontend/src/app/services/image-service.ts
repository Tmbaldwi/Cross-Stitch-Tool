import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from './../../../environments/environment';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
import { ImageAnalysis } from './models/image-analysis.model';
import { ThreadColor } from './models/thread-color.model';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private http = inject(HttpClient)
  private baseUrl = environment.apiBaseUrl;

  getRescaledImage(image: File) : Observable<ImageAnalysis>{
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
                old_width: oldWidth,
                old_height: oldHeight,
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

  getColorNormalizedImage(imageBlob: Blob) : Observable<any>{
    if(!imageBlob){
      console.error('No image blob was provided');
      return throwError(() => new Error('No image blob was provided'));
    };

    // Create API call
    const formData = new FormData();
    formData.append('image_file', imageBlob, "scaledImage.png");

    return this.http.post(
      `${this.baseUrl}/api/image/color-normalize-image`,
      formData
    ).pipe(
        catchError(err => {
          console.error('Palette parsing and color mapping failed:', err);
          return throwError(() => err as Error);
        })
      )
  }
}
