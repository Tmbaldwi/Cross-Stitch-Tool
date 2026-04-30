import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadSelectionStep } from './thread-selection-step';

describe('ThreadSelectionStep', () => {
  let component: ThreadSelectionStep;
  let fixture: ComponentFixture<ThreadSelectionStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadSelectionStep]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreadSelectionStep);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
