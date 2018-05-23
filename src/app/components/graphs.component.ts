import { ViewChildren, QueryList, Component, AfterViewInit, ViewChild, Input, SimpleChanges, OnChanges } from '@angular/core';
import * as Selection from 'd3-selection';
import * as Shape from 'd3-shape';
import * as Random from 'd3-random';
import * as Drag from 'd3-drag';

import { GuillocheDirective } from './../directives/guilloche.directive';
import { CanvasService } from './../services/canvas.service';
import { Graph } from '../models/graph.model';
import { Config } from './../models/config.model';

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class GraphsComponent implements AfterViewInit, OnChanges {

  public graphs: Graph[];
  public canvas: any | null;

  @Input() config: any;

  @ViewChild('svg') svgElementRef;
  @ViewChild(GuillocheDirective) guillocheViewChild: GuillocheDirective;
  @ViewChildren(GuillocheDirective) guillocheViewChildren: QueryList<GuillocheDirective>;

  constructor(
    private canvasService: CanvasService
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('graph component (changes:config)', changes.config.currentValue);
    this.updateCanvas();
    this.updateGraphs();
  }

  ngAfterViewInit() {
    console.log('graph component (afterView:children)', this.guillocheViewChildren.toArray());
  }

  private updateGraphs(): void {
    this.graphs = [...[{
      id: 'first',
      start: {coords: { x: 0, y: 0 }, direction: this.config.directionStart},
      end: { coords: { x: 0, y: -10 }, direction: this.config.directionEnd}
    }, {
      id: 'second',
      start: {coords: { x: 0, y: 0 }, direction: this.config.directionEnd },
      end: { coords: { x: 0, y: -10 }, direction: this.config.directionStart}
    }]];
  }

  private updateCanvas(): void {
    this.canvasService.set(this.svgElementRef.nativeElement);
  }
}
