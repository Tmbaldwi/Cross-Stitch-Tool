import { Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { ThreadColor } from '../../../../services/models/thread-color.model';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { ImageService } from '../../../../services/image-service';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-color-card',
  imports: [MatRadioModule, FormsModule, MatButton],
  templateUrl: './color-card.html',
  styleUrl: './color-card.scss',
})
export class ColorCard {
  readonly colorHex = input.required<string>();
  readonly threadMasterList = input.required<Record<string, ThreadColor>>();
  readonly colorSwap = input.required<(swapHex: string) => void>();
  readonly fetchSize = input.required<number>();
  colorOptions = model<string[]>();
  colorChoice = signal<string | null>(null);
  suggestionsLoading = signal(false);

  private service = inject(ImageService)

  protected colorChoiceBg = computed(() => {
    const choice = this.colorChoice();
    return choice == null
      ? this.colorHex()
      : this.threadMasterList()[choice].hex_value;
  });

  showMoreDisabled = computed(() => {
    return this.suggestionsLoading() || this.colorOptions()?.length == Object.keys(this.threadMasterList()).length;
  })

  constructor() {
    effect(() => {
      const options = this.colorOptions()!;
      if (options.length > 0 && this.colorChoice() === null) {
        this.colorChoice.set(options[0]);
        this.onColorChoice(options[0]);
      }
    });
  }

  onShowMore() : void {
    let newColorCount = Math.min(this.colorOptions()!.length + this.fetchSize(), Object.keys(this.threadMasterList()).length);
    let color : string[] = [ this.colorHex() ];
    
    this.suggestionsLoading.set(true);
    this.service.getThreadColorSuggestions(color, newColorCount).subscribe({
      next: (suggestions) => {
        this.colorOptions.set(suggestions[this.colorHex()]);
      },
      error: (err) => {
        console.error("Show more thread suggestion process failed: ", err);
      },
      complete: () => {
        this.suggestionsLoading.set(false);
      }
    })
  }

  onColorChoice(colorChoice: string) : void {
    this.colorSwap()(this.threadMasterList()[colorChoice].hex_value);
  }
}
