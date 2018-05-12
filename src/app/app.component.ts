import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

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
      }
    };
  }

  public updateCanvasConfig(config): void {
    this.canvasConfig = config;
  }
}
