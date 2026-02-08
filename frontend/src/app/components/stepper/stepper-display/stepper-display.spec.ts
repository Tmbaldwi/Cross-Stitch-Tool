import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepperDisplay } from './stepper-display';

describe('StepperDisplay', () => {
  let component: StepperDisplay;
  let fixture: ComponentFixture<StepperDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepperDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepperDisplay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
