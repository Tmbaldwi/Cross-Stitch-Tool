import { CdkStepper } from '@angular/cdk/stepper';
import { Component, inject, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ImageService } from '../../../services/image-service';

@Component({
  selector: 'app-thread-selection-step',
  imports: [],
  templateUrl: './thread-selection-step.html',
  styleUrl: './thread-selection-step.scss',
})
export class ThreadSelectionStep {
  readonly imageHistoryForm = input.required<FormGroup>();
  stepper = inject(CdkStepper)
  service = inject(ImageService)

  ngOnInit(){
    this.stepper.selectionChange.subscribe((event) =>{
      if(event.selectedIndex === 2){
        // TODO upload image and return palette/closest DMC colors
      }
    })
  }

}
