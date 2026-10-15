import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetryButton } from './retry-button';

describe('RetryButtonTest', () => {
  let component: RetryButton;
  let fixture: ComponentFixture<RetryButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetryButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetryButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
