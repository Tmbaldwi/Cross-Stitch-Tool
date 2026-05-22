import { Component, computed, inject, input, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FormGroup } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { ImageFrame } from "../../common/image-frame/image-frame";
import { CdkStepper } from '@angular/cdk/stepper';
import { ImageService } from '../../../services/image-service';

const selectedBorderColor : string = "#005CBB";
const unselectedBorderColor : string = 'grey';
const uploadedImageBorderStyle : string = '4px solid';
const unuploadedImageBorderStyle : string = '4px dashed';

@Component({
  selector: 'app-upload-step',
  imports: [MatButtonModule, MatStepperModule, MatButtonModule, MatIconModule, ImageFrame],
  templateUrl: './upload-step.html',
  styleUrl: './upload-step.scss',
})
export class UploadStep implements OnInit, OnDestroy {
  private stepper = inject(CdkStepper);
  private imageService = inject(ImageService)
  private selectedFileIdx = signal<number>(-1);

  public sampleImages = [ // TODO get sample images from backend
    { id: 1, imageUrl: 'https://picsum.photos/id/237/500/300' },
    { id: 2, imageUrl: 'https://picsum.photos/600/300' },
    { id: 3, imageUrl: 'https://picsum.photos/500/400' },
  ];

  public readonly imageHistoryForm = input.required<FormGroup>();
  public file = signal<File | null>(null);
  public previewUrl: string | null = null;
  public sampleImageFiles = signal<File[]>([]);
  public sampleImageUrls = signal<{id: number; imageUrl: string}[]>([]);
  public errorMessage = signal<string | null>(null);

  sampleImageBoxBorder = computed(() => {
    return (idx: number) => this.selectedFileIdx() === idx ? selectedBorderColor : unselectedBorderColor;
  })

  uploadBoxBorder = computed(() => {
    let borderStyle : string = !this.file() ? unuploadedImageBorderStyle : uploadedImageBorderStyle;

    return this.selectedFileIdx() === 0
      ? `${borderStyle} ${selectedBorderColor}`
      : `${borderStyle} ${unselectedBorderColor}`;
  });

  ngOnInit(): void {
    this.imageService.getSampleImages(3).subscribe({
      next: (files) => {
        this.sampleImageFiles.set(files)
        this.sampleImageUrls.set(files.map((f, idx) => ({
          id: idx + 1,
          imageUrl: URL.createObjectURL(f)
        })));
      },
      error: (err: Error) => {
        console.log("Sample image retrieval failed: ", err)
      }
    });
  }

  ngOnDestroy() {
    this.sampleImageUrls().forEach((url : any) => URL.revokeObjectURL(url.imageUrl));
    this.sampleImageUrls.set([])
  }

  isNextButtonDisabled(){
    return this.imageHistoryForm().get('originalImage')?.invalid;
  }

  onFileChange(files: FileList | null) {
    if (!files || files.length === 0 || files[0] == null) {
      this.clearUploadFile();
      return;
    }

    // Clear previous and set form for validation
    this.clearUploadFile();
    this.file.set(files[0]);
    this.imageHistoryForm().get('originalImage')?.setValue(this.file());

    // Form validation
    const fileControl = this.imageHistoryForm().get('originalImage');
    fileControl?.markAsTouched();
    fileControl?.updateValueAndValidity();

    if(fileControl?.invalid){
      this.imageHistoryForm().get('originalImage')?.setValue(null);
      this.clearUploadFile();
      this.errorMessage.set("File type must be png, jpg, or jpeg")
      return;
    }

    // If validation passes, keep them set
    this.errorMessage.set(null);
    this.previewUrl = URL.createObjectURL(this.file()!);
    this.selectImage(0);
  }

  clearUploadFile() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.file.set(null);
    this.previewUrl = null;

    if(this.selectedFileIdx() === 0){
      this.clearImageFileHistory();
      this.selectedFileIdx.set(-1);
    }
  }

  clearImageFileHistory(){
    this.imageHistoryForm().reset();
    this.stepper.reset();
  }

  selectUploadImage(){
    if(this.file() != null && this.selectedFileIdx() > 0){
      this.selectImage(0);
    }
  }

  selectImage(idx: number){
    this.selectedFileIdx.set(idx);
    this.clearImageFileHistory();

    if(idx === 0 && this.file()){
      this.imageHistoryForm().get('originalImage')?.setValue(this.file());
    }
    else if(idx > 0 && idx <= this.sampleImageUrls().length){
      this.imageHistoryForm().get('originalImage')?.setValue(this.sampleImageFiles()[idx-1])
    }
  }

  onCloseClick(event: Event){
    event.stopPropagation();
    this.clearUploadFile();
  }
}
