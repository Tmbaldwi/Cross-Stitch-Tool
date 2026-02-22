import { Component, inject } from '@angular/core';
import {MatStepperModule} from '@angular/material/stepper';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { UploadStep } from '../components/stepper-pages/upload-step/upload-step';
import { ImageScalingStep } from '../components/stepper-pages/image-scaling-step/image-scaling-step';
import { allowedFileTypes } from '../validators/file-type.validator';

@Component({
  selector: 'app-cross-stitch-tool-flow-manager',
  imports: [UploadStep, ImageScalingStep, MatStepperModule],
  templateUrl: './cross-stitch-tool-flow-manager.html',
  styleUrl: './cross-stitch-tool-flow-manager.scss',
})
export class CrossStitchToolFlowManager {
  private _formBuilder = inject(FormBuilder);

  imageFileHistoryForm = this._formBuilder.group({
    originalImage : new FormControl<File | null>(
      null, 
      [
        Validators.required, 
        allowedFileTypes(['png', 'jpeg', 'jpg'])
      ]
    ),
    scaledImageBase64 : new FormControl<string | null>(
      null, 
      [
        Validators.required, 
      ]
    ),
  });

  get uploadStepFileControl(): FormControl<File | null> {
    return this.imageFileHistoryForm.get('originalImage') as FormControl<File | null>;
  }

  get scalingStepFileControl(): FormControl<string | null> {
    return this.imageFileHistoryForm.get('scaledImageBase64') as FormControl<string | null>;
  }
}
