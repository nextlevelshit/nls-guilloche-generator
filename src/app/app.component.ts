import { ConfigForm } from './forms/config.form';
import { Component, OnInit } from '@angular/core';

import { Param } from './models/param.model';
import { Config } from './models/config.model';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public canvasParam: Param;
  public config: any | null;
  public configForm: FormGroup;

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
      width: 10,
      height: -20,
      directionStart: 180,
      directionEnd: 270
    };
  }

  ngOnInit() {
    this.configForm = ConfigForm;
    this.configForm.reset({...{
      width: 10,
      height: -20,
      directionStart: 180,
      directionEnd: 270
    }});
  }

  public updateGraphs() {
    this.config = {...this.configForm.value};
  }
}
