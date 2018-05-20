import { Component } from '@angular/core';

import { Param } from './models/param.model';
import { Config } from './models/config.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public canvasConfig: Config;
  public canvasParam: Param;

  constructor() {
    this.canvasParam = {
      colors: {
        start: '#cc0045',
        end: '#0067cc'
      },
      points: 3,
      margin: {
        x: 0.2,
        y: 0.4
      },
      stroke: {
        width: 0.2
      },
      spread: 80,
      showGrid: true
    };
  }

  public updateCanvasConfig(config): void {
    this.canvasConfig = config;
  }
}
