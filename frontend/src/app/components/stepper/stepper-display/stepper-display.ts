import { CdkStepper, CdkStepperModule } from '@angular/cdk/stepper';
import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'stepper-display',
  imports: [CdkStepperModule, NgTemplateOutlet],
  templateUrl: './stepper-display.html',
  styleUrl: './stepper-display.scss',
  providers: [{provide: CdkStepper, useExisting: StepperDisplay}],
})
export class StepperDisplay extends CdkStepper {
  onClick(index: number): void {
    this.selectedIndex = index;
  }
}
