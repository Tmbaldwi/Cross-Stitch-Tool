import { Component, computed, inject, output, signal } from '@angular/core';
import { FileDragAndDrop } from '../../../../directives/file-drag-and-drop';
import { CdkStepper } from '@angular/cdk/stepper';
import { ImageService } from '../../../../services/image-service';
import { MatButtonModule } from '@angular/material/button';

const selectedBorderColor : string = "#00F0FF";

@Component({
  selector: 'app-upload-step',
  imports: [FileDragAndDrop, MatButtonModule],
  templateUrl: './upload-step.html',
  styleUrl: './upload-step.scss',
})
export class UploadStep {
  sampleImages = [
    { id: 1, imageUrl: 'https://picsum.photos/id/237/500/300' },
    { id: 2, imageUrl: 'https://picsum.photos/600/300' },
    { id: 3, imageUrl: 'https://picsum.photos/500/400' },
  ];

  selectedFileIdx : number = -1;
  file: File | null = null;
  previewUrl: string | null = null;

  uploadBoxBorderStyle = signal('4px dashed !important');
  uploadBoxBorderColor = signal('grey');
  selectedBorderColor: string = selectedBorderColor;

  private service = inject(ImageService);
  private stepper = inject(CdkStepper);

  readonly isButtonDisabled = computed(() => {
    return this.service.originalFile() === null;
  });

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

    this.uploadBoxBorderStyle.set('4px dashed !important');
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
      
      this.uploadBoxBorderColor.set('grey');
    }
    else{
      this.service.setFile(this.file);
      this.uploadBoxBorderColor.set('#00F0FF');
    }
  }

  nextStep(){
    this.stepper.next();
  }
}
