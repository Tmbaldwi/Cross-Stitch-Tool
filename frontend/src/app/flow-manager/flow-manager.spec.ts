import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowManager } from './flow-manager';

describe('FlowManager', () => {
  let component: FlowManager;
  let fixture: ComponentFixture<FlowManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
