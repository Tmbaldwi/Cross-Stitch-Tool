import { Component, inject } from '@angular/core';
import {MatStepperModule} from '@angular/material/stepper';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { UploadStep } from '../components/stepper-pages/upload-step/upload-step';
import { ImageScalingStep } from '../components/stepper-pages/image-scaling-step/image-scaling-step';
import { allowedFileTypes } from '../validators/file-type.validator';
import { ImageNormalizationStep } from "../components/stepper-pages/image-normalization-step/image-normalization-step";

@Component({
  selector: 'app-cross-stitch-tool-flow-manager',
  imports: [UploadStep, ImageScalingStep, MatStepperModule, ImageNormalizationStep],
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
    scaledImageBitmap : new FormControl<ImageBitmap | null>(
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
    return this.imageFileHistoryForm.get('scaledImageBitmap') as FormControl<string | null>;
  }
}
