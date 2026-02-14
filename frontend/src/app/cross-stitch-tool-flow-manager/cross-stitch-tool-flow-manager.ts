import { Component, inject } from '@angular/core';
import {MatStepperModule} from '@angular/material/stepper';
import { FormBuilder, Validators } from '@angular/forms';
import { UploadStep } from '../components/stepper-pages/upload-step/upload-step';
import { ImageScalingStep } from '../components/stepper-pages/image-scaling-step/image-scaling-step';

@Component({
  selector: 'app-cross-stitch-tool-flow-manager',
  imports: [UploadStep, ImageScalingStep, MatStepperModule],
  templateUrl: './cross-stitch-tool-flow-manager.html',
  styleUrl: './cross-stitch-tool-flow-manager.scss',
})
export class CrossStitchToolFlowManager {
  private _formBuilder = inject(FormBuilder);

  uploadForm = this._formBuilder.group({
    file: [null, Validators.required],
  });
}
