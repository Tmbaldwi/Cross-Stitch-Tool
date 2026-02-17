import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from './../../../environments/environment';
import { Observable } from 'rxjs';

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

  getScaledDownSizeForImage() : Observable<ImageDimensions>{
    const formData = new FormData();

    const file = this._originalFile();
    if(!file){
      throw new Error('No file set');
    };

    formData.append('image_file', file, file.name);

    return this.http.post<ImageDimensions>(`${this.baseUrl}/api/image/resize-analysis`, formData);
  }
}

  export interface ImageDimensions {
    new_height: number;
    old_height: number;
    new_width: number;
    old_width: number
  }
