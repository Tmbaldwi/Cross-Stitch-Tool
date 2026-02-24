import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
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

  private _originalFile = signal<File | null>(null);
  readonly originalFile = this._originalFile.asReadonly();

  setFile(file: File | null){
    this._originalFile.set(file);
  }

  getRescaledImage() : Observable<ImageAnalysis>{
    const file = this._originalFile();

    if(!file){
      console.error('No file was set');
      return throwError(() => new Error('No file set'));
    };

    const formData = new FormData();
    formData.append('image_file', file, file.name);

    return this.http.post(
      `${this.baseUrl}/api/image/resize-image`, 
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
          console.error('Resize analysis failed:', err);
          return throwError(() => err as Error);
        })
    )
  }
}
