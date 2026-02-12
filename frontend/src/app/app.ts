import { Component, signal } from '@angular/core';
import { CrossStitchToolFlowManager } from "./cross-stitch-tool-flow-manager/cross-stitch-tool-flow-manager";

@Component({
  selector: 'app-root',
  imports: [CrossStitchToolFlowManager],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
