import { Graph } from './../models/graph.model';
import { ElementRef, HostListener, Output, EventEmitter, Input, Directive, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import * as Selection from 'd3-selection';
import * as Shape from 'd3-shape';
import * as Random from 'd3-random';
import * as Drag from 'd3-drag';

import { Config } from './../models/config.model';
import { Point } from './../models/point.model';
import { Param } from './../models/param.model';

@Directive({
  selector: '[guilloche]'
})
export class GuillocheDirective implements OnChanges {

  @Input() graph: Graph;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('guilloche directive (changes)', changes.graph);
  }
}
