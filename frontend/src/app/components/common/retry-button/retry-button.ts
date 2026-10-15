import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-retry-button',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './retry-button.html',
  styleUrl: './retry-button.scss',
  standalone: true,
})
export class RetryButton {
  isLoading = input<boolean>(false);
  retryClicked = output<void>();

  onRetryClicked() {
    this.retryClicked.emit();
  }
}

