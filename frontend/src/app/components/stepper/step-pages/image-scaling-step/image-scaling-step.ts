import { CdkStepper } from '@angular/cdk/stepper';
import { Component, inject, OnInit } from '@angular/core';
import { ImageService } from '../../../../services/image-service';

@Component({
  selector: 'app-image-scaling-step',
  imports: [],
  templateUrl: './image-scaling-step.html',
  styleUrl: './image-scaling-step.scss',
})
export class ImageScalingStep {
  private stepper = inject(CdkStepper);
  private service = inject(ImageService);

  ngOnInit(){
    console.log(this.stepper.selectedIndex)
    this.stepper.selectionChange
      .subscribe(e => {
        if(e.selectedIndex === 1){
          this.onActivated();
        }
      })
  }

  onActivated(){
    console.log("HIT")
    this.service.getScaledDownSizeForImage().subscribe((res) => console.log(res));
  }
}
