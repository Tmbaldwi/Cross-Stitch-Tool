import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from './../../../environments/environment';
import { catchError, Observable, tap, throwError } from 'rxjs';

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

    return this.http.post<ImageAnalysis>(
      `${this.baseUrl}/api/image/resize-image`, formData
    ).pipe(
      catchError(err => {
        console.error('Resize analysis failed:', err);

        return throwError(() => err as Error);
      })
    )
  }

}

  export interface ImageAnalysis {
    new_height: number;
    old_height: number;
    new_width: number;
    old_width: number;
    image_base64: string;
  }
