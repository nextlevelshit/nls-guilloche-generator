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

import { ElementRef, HostListener, Output, EventEmitter, Input, Directive, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import * as Selection from 'd3-selection';
import * as Shape from 'd3-shape';
import * as Random from 'd3-random';
import * as Drag from 'd3-drag';
import * as Ease from 'd3-ease';
import * as Timer from 'd3-timer';

import { environment as env } from './../../environments/environment';
import { Config } from './../models/config.model';
import { Graph } from './../models/graph.model';
import { Point } from './../models/point.model';
import { Param } from './../models/param.model';
import { CanvasService } from './../services/canvas.service';
import { MathService } from './../services/math.service';
import { GraphService } from '../services/graph.service';
import { AnimationService } from './../services/animation.service';

@Directive({
  selector: '[guilloche]'
})
export class GuillocheDirective implements OnChanges, OnDestroy {

  private canvas: any;
  private group: any;
  private bounce: any | null;
  private bounces: any | null;
  private initialNodes: any;
  private animationInterval: any;
  private medianPoint: Point;
  private medianIndex: number;
  private pathElements: any;

  @Input() graph: Graph;
  @Input() matrix: any;
  @Input() config: any;
  @Input() animate: boolean;

  @Output() guillocheChange = new EventEmitter();

  constructor(
    private canvasService: CanvasService,
    private el: ElementRef,
    private math: MathService,
    private graphService: GraphService,
    private animationService: AnimationService
  ) {
  }

  ngOnDestroy() {
    this.group.selectAll('*').remove();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.group = Selection.select(this.el.nativeElement);
    this.canvas = Selection.select(this.canvasService.get);
    // @todo modify graph here instead of in graphs.component.ts
    this.initialNodes = this.graph.nodes.slice();
    this.medianPoint = this.math.medianOfCurve(this.initialNodes);
    this.medianIndex = this.math.medianIndex(this.initialNodes);

    if (this.graphService.isAnimated) {
      this.graph.nodes = this.graph.nodes.slice().map((node, i) => {
        return {
          x: node.x,
          y: node.y,
          // ascent: Math.round(Math.random() * 100) / 100
          ascent: this.medianPoint.ascent + i * 0.5
        };
      });
      this.bounces = this.initialNodes.map(node => {
        // const bounceStart = Math.round(Math.random() * 100) / 100;
        const bounceAmplitude = Math.round(Math.random() * 150);
        return this.math.bounce(0, bounceAmplitude, 3);
      });
      this.animationInterval = setInterval(() => this.animateGraph(), 40);
    } else {
      if (this.animationInterval) {
        this.bounce = null;
        clearInterval(this.animationInterval);
        // return;
      }
    }

    this.group.selectAll('*').remove();
    this.pathElements = [];

    const graphs = this.spreadLines([
      this.graph.start.point,
      this.graph.start.direction,
      ...this.graph.nodes,
      this.graph.end.direction,
      this.graph.end.point,
    ]).forEach((points, index) => this.drawGraph(points));
    this.guillocheChanged();
  }

  private animateGraph() {
    const graphs = this.spreadLines([
      this.graph.start.point,
      this.graph.start.direction,
      ...this.graph.nodes.map((point, i) => {
        return this.graphService.shiftPoint(point, point.ascent, this.bounces[i].next().value);
      }),
      this.graph.end.direction,
      this.graph.end.point,
    ]);

    graphs.forEach((points, i) => this.updateGraph(points, i));
  }

  private spreadLines(points: Point[]) {
    const shiftedMedians = [];
    const genshiftedMedians = this.graphService.spreadOrthogonal(this.medianPoint, this.config.spread.spacing);

    for (let i = 0; i < this.config.spread.amount; i++) {
      shiftedMedians.push(genshiftedMedians.next().value);
    }

    return shiftedMedians.map(median => {
      const shiftedPoints = points.slice();
      shiftedPoints.splice(this.medianIndex, 1, median);
      return shiftedPoints;
    });
  }

  private updateGraph(points: Point[], index: number): void {
    this.pathElements[index]
      .attr('d', Shape.line()
        .x(p => p.x)
        .y(p => p.y)
        .curve(Shape.curveBasis)(points));

    // if (env.debug) {
    //   this.group.selectAll('circle').remove();
    //   this.group.selectAll('text').remove();
    //   // this.debugGraph(points);
    // }
  }

  private drawGraph(points: Point[]): void {
    this.group
      .attr('stroke', this.graph.color)
      .attr('stroke-width', this.graph.stroke)
      .attr('fill', 'none');

    this.pathElements.push(
      this.group.append('path')
        .attr('d', Shape.line()
          .x(p => p.x)
          .y(p => p.y)
          .curve(Shape.curveBasis)(points)));

    if (env.debug) {
      this.debugGraph(points);
    }
  }

  public guillocheChanged() {
    this.guillocheChange.emit(this.el.nativeElement);
  }

  private debugGraph(points: Point[]) {
    points.forEach((point, index) => {
      const circle = this.group.append('g');

      circle.append('circle')
        .attr('cx', point.x)
        .attr('cy', point.y)
        .attr('r', 3)
        .attr('fill-opacity', 0.6)
        .attr('fill', this.graph.color);

      circle.append('text')
        .attr('x', point.x)
        .attr('y', point.y)
        .attr('dx', 8)
        .attr('dy', 15)
        .attr('fill', this.graph.color)
        .text(index);
    });
  }

  private debugBounce(point: Point): void {
    if (env.debug) {
      this.group.append('circle')
        .attr('cx', point.x)
        .attr('cy', point.y)
        .attr('r', 2)
        .attr('fill-opacity', 0.4)
        .attr('fill', 'darkgray');
    }
  }
}
