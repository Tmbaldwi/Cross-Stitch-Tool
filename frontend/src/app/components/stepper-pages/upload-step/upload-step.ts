import { Component, computed, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FileDragAndDrop } from '../../../directives/file-drag-and-drop';
import { ImageService } from '../../../services/image-service';
import { FormGroup } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import {MatIconModule} from '@angular/material/icon';

const selectedBorderColor : string = "#005CBB";
const unselectedBorderColor : string = 'grey';

@Component({
  selector: 'app-upload-step',
  imports: [FileDragAndDrop, MatButtonModule, MatStepperModule, MatButtonModule, MatIconModule],
  templateUrl: './upload-step.html',
  styleUrl: './upload-step.scss',
})
export class UploadStep {
  readonly form = input.required<FormGroup>();

  sampleImages = [
    { id: 1, imageUrl: 'https://picsum.photos/id/237/500/300' },
    { id: 2, imageUrl: 'https://picsum.photos/600/300' },
    { id: 3, imageUrl: 'https://picsum.photos/500/400' },
  ];

  selectedFileIdx : number = -1;
  file: File | null = null;
  previewUrl: string | null = null;

  uploadBoxBorderStyle = signal('4px dashed !important');
  uploadBoxBorderColor = signal(unselectedBorderColor);
  selectedBorderColor: string = selectedBorderColor;

  private service = inject(ImageService);

  onFileChange(files: FileList | null) {
    if (!files || files.length === 0) {
      this.clearFile();
      return;
    }

    this.clearFile();

    this.file = files[0];
    this.previewUrl = URL.createObjectURL(this.file);

    this.uploadBoxBorderStyle.set('4px solid !important');
    this.selectImage(0);
  }

  clearFile() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.file = null;
    this.previewUrl = null;

    if(this.selectedFileIdx == 0){
      this.service.setFile(null);
      this.form().patchValue({ file: null });
      this.selectedFileIdx = -1;
    }
    else{
      // TODO remove when sample images are implemented
      this.service.setFile(null);
      this.form().patchValue({ file: null });
    }

    this.uploadBoxBorderStyle.set('4px dashed !important');
    this.uploadBoxBorderColor.set(unselectedBorderColor);
  }

  selectUploadImage(){
    if(this.file != null && this.selectedFileIdx > 0){
      this.selectImage(0);
    }
  }

  selectImage(idx: number){
    this.selectedFileIdx = idx;

    if(this.selectedFileIdx > 0){
      // TODO set file to image
      
      this.uploadBoxBorderColor.set(unselectedBorderColor);
    }
    else{
      // TODO adjust for sample images
      this.form().patchValue({ file: this.file });

      this.service.setFile(this.file);
      this.uploadBoxBorderColor.set(selectedBorderColor);
    }
  }
}
