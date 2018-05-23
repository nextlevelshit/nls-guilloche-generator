import { ConfigForm } from './forms/config.form';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { environment as env } from '../environments/environment';
import { Param } from './models/param.model';
import { Config } from './models/config.model';

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

    this.config = env.formDefaults;
    this.configForm = ConfigForm;
  }

  ngOnInit() {
    this.configForm.reset({...this.config});
  }

  public updateGraphs() {
    this.config = {...this.configForm.value};
  }
}
