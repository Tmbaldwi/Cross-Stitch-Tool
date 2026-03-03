import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageFrame } from './image-frame';

describe('ImageFrame', () => {
  let component: ImageFrame;
  let fixture: ComponentFixture<ImageFrame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageFrame]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageFrame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
