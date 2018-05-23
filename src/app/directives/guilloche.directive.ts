import { Graph } from './../models/graph.model';
import { ElementRef, HostListener, Output, EventEmitter, Input, Directive, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import * as Selection from 'd3-selection';
import * as Shape from 'd3-shape';
import * as Random from 'd3-random';
import * as Drag from 'd3-drag';

import { Config } from './../models/config.model';
import { Point } from './../models/point.model';
import { Param } from './../models/param.model';
import { CanvasService } from './../services/canvas.service';

@Directive({
  selector: '[guilloche]'
})
export class GuillocheDirective implements OnChanges {

  private canvas: any;

  @Input() graph: Graph;

  constructor(
    private canvasService: CanvasService
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('guilloche directive (changes)', changes.graph.currentValue);
    this.selectCanvas();
    this.drawGraph();
  }

  private drawGraph(): void {
    console.log('guilloche directive(drawGraph)', this.graph, this.canvas);
  }

  private selectCanvas(): void {
    this.canvas = Selection.select(this.canvasService.get);
  }
}
