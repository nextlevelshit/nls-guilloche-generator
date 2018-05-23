import { ConfigForm } from './forms/config.form';
import { Component, OnInit, HostListener } from '@angular/core';
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

  @HostListener('mousewheel', ['$event'])
  private onWheelUp(event) {
    const delta = Math.sign(event.deltaY);
    const step = 0.01;

    this.config = {...this.configForm.value};

    if (delta > 0) {
      if (this.config.scale === 1 - step) {
        return;
      }
      this.config.scale += step;
    } else {
      if (this.config.scale === step) {
        return;
      }
      this.config.scale -= step;
    }

    this.config.scale = Math.round(this.config.scale * 100) / 100;

    this.configForm.reset({...this.config});
    this.updateGraphs();
  }


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
