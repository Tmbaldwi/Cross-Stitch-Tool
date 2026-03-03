import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageNormalizationStep } from './image-normalization-step';

describe('ImageNormalizationStep', () => {
  let component: ImageNormalizationStep;
  let fixture: ComponentFixture<ImageNormalizationStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageNormalizationStep]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageNormalizationStep);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
