import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from './../../../environments/environment';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
import { ImageRescaleResponse } from './models/image-rescale-response.model';
import { ImageColorNormalizeResponse } from './models/image-color-normalize-response.model';
import { ThreadColor } from './models/thread-color.model';
import JSZip from 'jszip';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private http = inject(HttpClient)
  private baseUrl = environment.apiBaseUrl;

  // TODO consider trying to use http client, otherwise just leave it

// getSampleImages(numSamples: number): Observable<File[]> {
//   return this.http.get(
//     `${this.baseUrl}/api/image/sample-images?n=${numSamples}`,
//     { responseType: 'blob' }
//   ).pipe(
//     catchError((error: HttpErrorResponse) => {
//       // When responseType is 'blob', errors also come back as Blobs — must read as text first
//       if (error.error instanceof Blob) {
//         return from(error.error.text()).pipe(
//           switchMap((text) => {
//             try {
//               const parsed = JSON.parse(text);
//               return throwError(() => new Error(`Server error ${error.status}: ${parsed.detail ?? error.statusText}`));
//             } catch {
//               return throwError(() => new Error(`Server error ${error.status}: ${error.statusText}`));
//             }
//           })
//         );
//       }
//       return throwError(() => new Error(error.message));
//     }),
//     switchMap((blob) => from(this.extractFilesFromZip(blob)))
//   );
// }

getSampleImages(numSamples: number): Observable<File[]> {
  const url = `${this.baseUrl}/api/image/sample-images?n=${numSamples}`;

  return from(
    fetch(url)
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(`Server error ${response.status}: ${err.detail ?? response.statusText}`);
          });
        }
        return response.blob();
      })
      .then(blob => this.extractFilesFromZip(blob))
  ).pipe(
    catchError(err => {
      console.error('Sample image get failed:', err);
      return throwError(() => err as Error);
    })
  );
}

  private async extractFilesFromZip(blob: Blob): Promise<File[]> {
    const zip = await JSZip.loadAsync(blob);

    const filePromises = Object.entries(zip.files)
      .filter(([_, zipEntry]) => !zipEntry.dir)
      .map(async ([filename, zipEntry]) => {
        const fileBlob = await zipEntry.async('blob');
        const ext = filename.split('.').pop()?.toLowerCase();
        const mimeMap: Record<string, string> = {
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
        };
        const mime = mimeMap[ext ?? ''] ?? 'application/octet-stream';
        return new File([fileBlob], filename, { type: mime });
      });

    return Promise.all(filePromises);
  }

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

  getThreadColorMasterList() : Observable<Record<string, ThreadColor>> {
    return this.http.get<ThreadColor[]>(
      `${this.baseUrl}/api/image/dmc-thread-colors`,
    ).pipe(
      map(response => response.reduce((dict, threadColor) => {
        dict[threadColor.dmc_id] = threadColor;
        return dict;
      }, {} as Record<string, ThreadColor>)),
      catchError(err => {
        console.error("Thread master list retrieval failed:", err);
        return throwError(() => err as Error);
      })
    )
  }

  getThreadColorSuggestions(palette : string[], requestCount: number) : Observable<Record<string, string[]>> {
    if(palette == null || palette.length == 0){
      console.error("No color palette was provided");
      return throwError(() => new Error("No color palette was provided"));
    }

    return this.http.post<any[]>(
      `${this.baseUrl}/api/image/find-closest-dmc-colors`,
      {
        color_palette: palette,
        request_count: requestCount
      }
    ).pipe(
      map(response => response.reduce((dict, colorMatch) => {
        dict[colorMatch[0]] = colorMatch[1];
        return dict;
      }, {} as Record<string, string[]>)),
      catchError(err => {
        console.error("Thread color suggestions retrieval failed: ", err);
        return throwError(() => err as Error);
      })
    )
  }
}
