import { Component, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';

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
  public test: number;

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
      spread: 80,
      showGrid: true
    };

    /**
     * A test of canvasParam.margin change and binding to canvas.directive
     */
    let x = 1;
    let intrvlId = setInterval(() => {
      if (x < 5) {
        this.canvasParam.margin.x += 0.2;
        x += 1;
        console.log("canvas param  ", this.canvasParam.margin.x);
      } else {
        clearInterval(intrvlId);
      }
    }, 1000);
    /**
     * 
     */
  };

  public updateCanvasConfig(config): void {
    this.canvasConfig = config;
  }
}
