import { Component, computed, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FileDragAndDrop } from '../../../directives/file-drag-and-drop';
import { ImageService } from '../../../services/image-service';
import { FormControl, FormGroup } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import {MatIconModule} from '@angular/material/icon';

const selectedBorderColor : string = "#005CBB";
const unselectedBorderColor : string = 'grey';
const uploadedImageBorderStyle : string = '4px solid';
const unuploadedImageBorderStyle : string = '4px dashed';

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

  selectedFileIdx = signal<number>(-1);
  file = signal<File | null>(null);
  previewUrl: string | null = null;
  errorMessage = signal<string | null>(null);

  sampleImageBoxBorder = computed(() => {
    return (idx: number) => this.selectedFileIdx() === idx ? selectedBorderColor : unselectedBorderColor;
  })

  uploadBoxBorder = computed(() => {
    let borderStyle : string = !this.file() ? unuploadedImageBorderStyle : uploadedImageBorderStyle;

    return this.selectedFileIdx() === 0
      ? `${borderStyle} ${selectedBorderColor}`
      : `${borderStyle} ${unselectedBorderColor}`;
  });

  private service = inject(ImageService);

  onFileChange(files: FileList | null) {
    if (!files || files.length === 0 || files[0] == null) {
      this.clearFile();
      return;
    }

    // Clear previous and set form for validation
    this.clearFile();
    this.file.set(files[0]);
    this.form().patchValue({ file: this.file() });

    // Form validation
    const fileControl = this.form().get('file');
    fileControl?.markAsTouched();
    fileControl?.updateValueAndValidity();

    if(fileControl?.invalid){
      this.form().patchValue({ file: null })
      this.clearFile();
      this.errorMessage.set("File type must be png, jpg, or jpeg")
      return;
    }

    // If validation passes, keep them set
    this.errorMessage.set(null);
    this.previewUrl = URL.createObjectURL(this.file()!);
    this.selectImage(0);

  }

  clearFile() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.file.set(null);
    this.previewUrl = null;

    // TODO this will need to be changed for sample images
    this.service.setFile(null);
    this.form().patchValue({ file: null });

    if(this.selectedFileIdx() === 0){
      this.selectedFileIdx.set(-1);
    }
  }

  selectUploadImage(){
    if(this.file() != null && this.selectedFileIdx() > 0){
      this.selectImage(0);
    }
  }

  selectImage(idx: number){
    this.selectedFileIdx.set(idx);

    if(idx === 0 && this.file()){
      // TODO adjust for sample images
      this.service.setFile(this.file());
    }

    if(idx > 0){
      // TODO handle sample images
    }
  }

  onCloseClick(event: Event){
    event.stopPropagation();
    this.clearFile();
  }
}
