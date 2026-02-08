import { Component, signal } from '@angular/core';
import { FlowManager } from "./flow-manager/flow-manager";

@Component({
  selector: 'app-root',
  imports: [FlowManager],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
