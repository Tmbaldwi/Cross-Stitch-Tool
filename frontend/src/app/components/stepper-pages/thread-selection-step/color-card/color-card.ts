import { Component, computed, effect, ElementRef, input, signal, ViewChild } from '@angular/core';
import { ThreadColor } from '../../../../services/models/thread-color.model';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-card',
  imports: [MatRadioModule, FormsModule],
  templateUrl: './color-card.html',
  styleUrl: './color-card.scss',
})
export class ColorCard {
  readonly colorHex = input.required<string>();
  readonly threadMasterList = input.required<Record<string, ThreadColor>>();
  readonly colorSwap = input.required<(swapHex: string) => void>();
  colorOptions = input.required<string[]>();
  colorChoice = signal<string | null>(null);

  protected colorChoiceBg = computed(() => {
    const choice = this.colorChoice();
    return choice == null
      ? this.colorHex()
      : this.threadMasterList()[choice].hex_value;
  });

constructor() {
  effect(() => {
    const options = this.colorOptions();
    if (options.length > 0 && this.colorChoice() === null) {
      this.colorChoice.set(options[0]);
      this.onColorChoice(options[0]);
    }
  });
}

  onColorChoice(colorChoice: string) : void {
    this.colorSwap()(this.threadMasterList()[colorChoice].hex_value);
  }
}
