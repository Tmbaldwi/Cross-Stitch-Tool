import { Component } from '@angular/core';
import { StepperDisplay } from "../components/stepper/stepper-display/stepper-display";
import { CdkStep } from '@angular/cdk/stepper';
import { UploadStep } from "../components/stepper/step-pages/upload-step/upload-step";
import { ImageScalingStep } from "../components/stepper/step-pages/image-scaling-step/image-scaling-step";

@Component({
  selector: 'app-cross-stitch-tool-flow-manager',
  imports: [StepperDisplay, CdkStep, UploadStep, ImageScalingStep],
  templateUrl: './cross-stitch-tool-flow-manager.html',
  styleUrl: './cross-stitch-tool-flow-manager.scss',
})
export class CrossStitchToolFlowManager {
  uploadedFile: File | null = null;

  onFileSelected(file: File | null){
    this.uploadedFile = file;
  }
}
