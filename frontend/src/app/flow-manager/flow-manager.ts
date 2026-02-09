import { Component } from '@angular/core';
import { StepperDisplay } from "../components/stepper/stepper-display/stepper-display";
import { CdkStep } from '@angular/cdk/stepper';
import { UploadStep } from "../components/stepper/step-pages/upload-step/upload-step";

@Component({
  selector: 'app-flow-manager',
  imports: [StepperDisplay, CdkStep, UploadStep],
  templateUrl: './flow-manager.html',
  styleUrl: './flow-manager.scss',
})
export class FlowManager {

}
