import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrossStitchToolFlowManager } from './cross-stitch-tool-flow-manager';

describe('CrossStitchToolFlowManager', () => {
  let component: CrossStitchToolFlowManager;
  let fixture: ComponentFixture<CrossStitchToolFlowManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrossStitchToolFlowManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrossStitchToolFlowManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
