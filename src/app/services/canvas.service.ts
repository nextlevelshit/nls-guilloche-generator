import { Inject, Injectable, Optional, ViewChild } from '@angular/core';
import * as Selection from 'd3-selection';

@Injectable()
export class CanvasService {

  public canvas: any;

  constructor() {
  }

  public get get() {
    return this.canvas;
  }

  public set(el) {
    this.canvas = el;
  }
}
