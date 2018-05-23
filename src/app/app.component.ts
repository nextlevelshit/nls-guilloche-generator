import { Component, OnInit } from '@angular/core';

import { Param } from './models/param.model';
import { Config } from './models/config.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public canvasParam: Param;
  public config: any;

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
        width: 2
      },
      spread: 20,
      showGrid: false
    };

    this.config = {
      start: {
        direction: 0
      },
      end: {
        direction: 270,
        position: {
          x: 16,
          y: -9
        }
      }
    };
  }
}
