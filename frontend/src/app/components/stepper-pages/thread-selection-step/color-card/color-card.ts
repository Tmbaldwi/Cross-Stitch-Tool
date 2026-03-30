import { Component, input } from '@angular/core';
import { ThreadColor } from '../../../../services/models/thread-color.model';

@Component({
  selector: 'app-color-card',
  imports: [],
  templateUrl: './color-card.html',
  styleUrl: './color-card.scss',
})
export class ColorCard {
  readonly colorHex = input.required<string>();
  colorOptions = input.required<string[]>();
  threadMasterList = input.required<Record<string, ThreadColor>>();
  
}
