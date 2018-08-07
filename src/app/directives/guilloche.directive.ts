/**
 * Copyright (C) 2018 Michael Czechowski <mail@dailysh.it>
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; version 2.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 51
 * Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 */

import { ElementRef, HostListener, Output, EventEmitter, Input, Directive, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import * as Selection from 'd3-selection';
import * as Shape from 'd3-shape';
import * as Random from 'd3-random';
import * as Drag from 'd3-drag';

import { environment as env } from './../../environments/environment';
import { Config } from './../models/config.model';
import { Graph } from './../models/graph.model';
import { Point } from './../models/point.model';
import { Param } from './../models/param.model';
import { CanvasService } from './../services/canvas.service';
import { ArithmeticService } from './../services/arithmetic.service';

@Directive({
  selector: '[guilloche]'
})
export class GuillocheDirective implements OnChanges {

  private canvas: any;
  private group: any;

  @Input() graph: Graph;
  @Input() matrix: any;
  @Input() config: any;

  @Output() guillocheChange = new EventEmitter();

  constructor(
    private canvasService: CanvasService,
    private el: ElementRef,
    private arithmetics: ArithmeticService
  ) {
    this.group = Selection.select(el.nativeElement);
    this.canvas = Selection.select(this.canvasService.get);
  }

  ngOnChanges(changes: SimpleChanges) {
    const points = [
      this.graph.start.point,
      ...this.graph.nodes,
      this.graph.end.point
    ];
    this.spreadLines(points);
    this.guillocheChanged();
  }

  public guillocheChanged() {
    this.guillocheChange.emit(this.el.nativeElement);
  }

  private drawGraph(points: Point[]): void {
    this.group.append('path')
      .attr('d', Shape.line()
        .x(p => p.x)
        .y(p => p.y)
        .curve(Shape.curveBasis)(points))
      .attr('stroke', this.graph.color)
      .attr('stroke-width', this.graph.stroke)
      .attr('fill', 'none');

    if (!env.production) {
      this.showGrid();
    }
  }

  private spreadLines(points: Point[]) {
    const indexMiddle = Math.floor(points.length * 0.5);
    const pointMiddle = points[indexMiddle];
    const closestCenter = this.arithmetics.getClosestCenter(pointMiddle, this.matrix);
    const radius = this.arithmetics.Δ(pointMiddle, closestCenter);
    const spreadPoints = [];
    const pies = 80;

    for (let i = 0; i < pies; i++) {
      spreadPoints.push({
        x: radius * Math.cos(2 * i * Math.PI / pies) + closestCenter.x,
        y: radius * Math.sin(2 * i * Math.PI / pies) + closestCenter.y,
      });
    }

    spreadPoints.sort((a, b) => {
      // Good possibility to align orientation points outsite
      return this.arithmetics.Δ(b, pointMiddle) - this.arithmetics.Δ(a, pointMiddle);
    });

    spreadPoints.some((point, index) => {
      points[indexMiddle] = point;

      this.drawGraph(points);

      return index === this.config.spread - 1;
    });

  }

  private showGrid() {
    this.graph.nodes.forEach(point => {
      this.group.append('circle')
        .attr('cx', point.x)
        .attr('cy', point.y)
        .attr('r', 3)
        .attr('stroke-width', 0.1)
        .attr('fill-opacity', 0)
        .attr('stroke', 'darkgray');
    });
  }
}
