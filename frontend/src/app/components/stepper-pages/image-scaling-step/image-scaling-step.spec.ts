import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageScalingStep } from './image-scaling-step';

describe('ImageScalingStep', () => {
  let component: ImageScalingStep;
  let fixture: ComponentFixture<ImageScalingStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageScalingStep]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageScalingStep);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
