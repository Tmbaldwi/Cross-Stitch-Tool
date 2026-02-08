import { Component } from '@angular/core';
import { StepperDisplay } from "../components/stepper/stepper-display/stepper-display";
import { CdkStep } from '@angular/cdk/stepper';

@Component({
  selector: 'app-flow-manager',
  imports: [StepperDisplay, CdkStep],
  templateUrl: './flow-manager.html',
  styleUrl: './flow-manager.scss',
})
export class FlowManager {

}
