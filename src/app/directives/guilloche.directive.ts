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
  private group: any;

  @Input() graph: Graph;

  constructor(
    private canvasService: CanvasService,
    private el: ElementRef
  ) {
    this.group = Selection.select(el.nativeElement);
    this.canvas = Selection.select(this.canvasService.get);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('guilloche directive (changes)', changes.graph.currentValue);
    this.drawGraph();
  }

  private drawGraph(): void {
    console.log('guilloche directive(drawGraph)', this.graph);

    this.group.append('path')
      .attr('d', Shape.line()
        .x(p => p.x)
        .y(p => p.y)
        .curve(Shape.curveBasis)([
          this.graph.start.coords,
          this.graph.end.coords
        ]))
      .attr('stroke', 'url(#gradient)')
      .attr('stroke-width', this.graph.stroke)
      .attr('fill', 'none');

    this.group.append('circle')
      .attr('cx', this.graph.start.coords.x)
      .attr('cy', this.graph.start.coords.y)
      .attr('r', 20)
      .attr('stroke-width', 1)
      .attr('fill-opacity', 0)
      .attr('stroke', this.graph.start.color);

    this.group.append('circle')
      .attr('cx', this.graph.end.coords.x)
      .attr('cy', this.graph.end.coords.y)
      .attr('r', 10)
      .attr('stroke-width', 1)
      .attr('fill-opacity', 0)
      .attr('stroke', this.graph.end.color);
  }
}
