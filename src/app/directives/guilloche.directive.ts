import { Graph } from './../models/graph.model';
import { ElementRef, HostListener, Output, EventEmitter, Input, Directive, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import * as Selection from 'd3-selection';
import * as Shape from 'd3-shape';
import * as Random from 'd3-random';
import * as Drag from 'd3-drag';

import { environment as env } from './../../environments/environment';
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
  private gradientId: any;

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
    this.defineGradient();
    this.drawGraph();
  }

  private defineGradient(): void {
    this.gradientId = `gradient-${this.graph.id}`;

    const defs = this.group.append('defs');
    const grad = defs.append('linearGradient')
      .attr('id', this.gradientId);
    grad.append('stop')
      .attr('stop-color', this.graph.start.color)
      .attr('offset', '0%');
    grad.append('stop')
      .attr('stop-color', this.graph.end.color)
      .attr('offset', '100%');
  }

  private drawGraph(): void {
    const points = [this.graph.start.coords, ...this.graph.nodes, this.graph.end.coords];

    this.group.append('path')
      .attr('d', Shape.line()
        .x(p => p.x)
        .y(p => p.y)
        .curve(Shape.curveBasis)(points))
      .attr('stroke', `url(#${this.gradientId})`)
      .attr('stroke-width', this.graph.stroke)
      .attr('fill', 'none');

    if (!env.production) {
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

      this.graph.nodes.forEach(point => {
        this.group.append('circle')
          .attr('cx', point.x)
          .attr('cy', point.y)
          .attr('r', 5)
          .attr('stroke-width', 1)
          .attr('fill-opacity', 0)
          .attr('stroke', 'darkgray');
      });
    }

    console.log('guilloche directive(drawGraph)', this.graph);
  }
}
