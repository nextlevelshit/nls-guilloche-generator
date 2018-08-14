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

import { ElementRef, HostListener, Output, EventEmitter, Input, Directive, OnChanges, SimpleChanges } from '@angular/core';
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
// import { spread } from 'q';

@Directive({
  selector: '[guilloche]'
})
export class GuillocheDirective implements OnChanges {

  private canvas: any;
  private group: any;
  private bounce: any | null;
  private bounces: any | null;
  private initialNodes: any;
  private animationInterval: any;
  private medianPoint: Point;
  private medianIndex: number;

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
    this.group = Selection.select(el.nativeElement);
    this.canvas = Selection.select(this.canvasService.get);
  }

  ngOnChanges(changes: SimpleChanges) {
    // @todo modify graph here instead of in graphs.component.ts
    this.group.selectAll('*').remove();

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
        const bounceStart = Math.round(Math.random() * 10) / 10;
        const bounceAmplitude = Math.round(Math.random() * 100);
        return this.math.bounce(bounceStart, bounceAmplitude, 2);
      });
      this.animationInterval = setInterval(() => this.animateGraph(), 120);
    } else {
      if (this.animationInterval) {
        this.bounce = null;
        clearInterval(this.animationInterval);
      }
    }

    this.guillocheChanged();
    this.spreadLines([
      this.graph.start.point,
      this.graph.start.direction,
      ...this.graph.nodes,
      this.graph.end.point,
      this.graph.end.direction,
    ]);
  }

  private animateGraph() {
    // const medianIndex = this.math.medianIndex(this.initialNodes);
    // const bouncedMedian = this.graphService.shiftPoint(medianPoint, medianPoint.ascent, this.bounce.next().value);

    // this.graph.nodes.splice(medianIndex, 1, bouncedMedian);

    this.group.selectAll('*').remove();

    this.spreadLines([
      this.graph.start.point,
      this.graph.start.direction,
      ...this.graph.nodes.map((point, i) => {
        return this.graphService.shiftPoint(point, point.ascent, this.bounces[i].next().value);
      }),
      this.graph.end.direction,
      this.graph.end.point,
    ]);
    // this.debugBounce(bouncedMedian);
  }

  private spreadLines(points: Point[]) {
    const shiftedMedians = [];
    // Alternatively use median of curve instead of center
    // const medianPoint = this.math.medianOfCurve(points);
    // const medianPoint = this.math.centerOfCurve(points);
    // const medianIndex = this.math.medianIndex(points);
    const genshiftedMedians = this.graphService.spreadOrthogonal(this.medianPoint, this.config.spread.spacing);

    for (let i = 0; i < this.config.spread.amount; i++) {
      shiftedMedians.push(genshiftedMedians.next().value);
    }

    // if (env.debug) {
    //   [medianPoint, ...shiftedMedians].forEach((point, index) => {
    //     this.group.append('circle')
    //       .attr('cx', point.x)
    //       .attr('cy', point.y)
    //       .attr('r', 10 / index)
    //       .attr('fill-opacity', 0.6)
    //       .attr('fill', 'darkgray');
    //   });
    // }

    shiftedMedians.forEach(median => {
      const shiftedGraph = points.slice();
      shiftedGraph.splice(this.medianIndex, 1, median);
      this.drawGraph(shiftedGraph);
    });
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
