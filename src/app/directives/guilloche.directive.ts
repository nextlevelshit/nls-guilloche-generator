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

import { ElementRef, HostListener, Output, EventEmitter, Input, Directive, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
import { spread } from 'q';

@Directive({
  selector: '[guilloche]'
})
export class GuillocheDirective implements OnChanges, OnInit {

  private canvas: any;
  private group: any;
  private animationInterval: any;
  private x: any;
  private y: any;

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

  ngOnInit() {
    // console.log('guilloche:init');
    // Timer.timer(function(elapsed) {
    //   let t = (elapsed % 3000) / 3000;
    //   console.log(t);
    //   // dot1.attr("cx", x(t)).attr("cy", y(ease(t)));
    //   // dot2.attr("cy", y(ease(t)));
    // });

    // console.log(Ease.easeLinear(0.5));
    // const t = Timer.timer(function(elapsed) {
    //   if (elapsed > 200) {
    //     t.stop();
    //   }
    // }, 1000);
  }

  ngOnChanges(changes: SimpleChanges) {
    // @todo modify graph here instead of in graphs.component.ts
    this.group.selectAll('*').remove();

    // console.log('guilloche:changes', changes);

    if (this.graphService.isAnimated) {
      console.log('is animated');
      // this.graphService.startAnimation();
      this.animationInterval = setInterval(() => this.animateGraph(), 60);
    } else {
      if (this.animationInterval) {
        console.log('not animated');
        // this.graphService.stopAnimation();
        clearInterval(this.animationInterval);
      }
    }

    const points = [
      this.graph.start.point,
      ...this.graph.nodes,
      this.graph.end.point
    ];
    this.spreadLines(points);
    this.guillocheChanged();
  }

  private animateGraph() {
    this.group.selectAll('*').remove();
    this.graph = this.animationService.animate(this.graph);
    // this.saveGraph();
    const points = [
      this.graph.start.point,
      ...this.graph.nodes,
      this.graph.end.point
    ];
    this.spreadLines(points);
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

    if (env.grid) {
      this.showGrid();
    }
  }

  private spreadLines(points: Point[]) {
    const shiftedMedians = [];
    const medianPoint = this.math.centerOfCurve(points);
    const medianIndex = this.math.medianIndex(points);
    const genshiftedMedians = this.graphService.spreadOrthogonal(medianPoint, 20);

    for (let i = 0; i < this.config.spread; i++) {
      shiftedMedians.push(genshiftedMedians.next().value);
    }

    // const indexMiddle = Math.floor(points.length * 0.5);
    // const pointMiddle = points[indexMiddle];
    // const closestCenter = this.math.getClosestCenter(pointMiddle, this.matrix);
    // const radius = this.math.Δ(pointMiddle, closestCenter);
    // const shiftedMedians = [];
    // const pies = 200;

    // for (let i = 0; i < pies; i++) {
      //   shiftedMedians.push({
        //     x: radius * Math.cos(2 * i * Math.PI / pies) + closestCenter.x,
        //     y: radius * Math.sin(2 * i * Math.PI / pies) + closestCenter.y,
        //   });
        // }

        // shiftedMedians.sort((a, b) => {
          //   // Good possibility to align orientation points outsite
          //   return this.math.Δ(b, pointMiddle) - this.math.Δ(a, pointMiddle);
          // });

          // console.log(shiftedMedians);

          // shiftedMedians.some((point, index) => {
            //   points[indexMiddle] = point;

            //   this.drawGraph(points);

            //   return index === this.config.spread - 1;
            // });
    if (env.grid) {
      [medianPoint, ...shiftedMedians].forEach((point, index) => {
        this.group.append('circle')
          .attr('cx', point.x)
          .attr('cy', point.y)
          .attr('r', 10 / index)
          .attr('fill-opacity', 0.6)
          .attr('fill', 'darkgray');
      });
    }

    shiftedMedians.forEach(median => {
      const shiftedGraph = points.slice();
      shiftedGraph.splice(medianIndex, 1, median);
      this.drawGraph(shiftedGraph);
    });

    // this.drawGraph(points);
  }

  // private animateRange(n: number) {
  //   return Ease.scaleLinear().range([n, n + 100]);
  // }

  private showGrid() {
    this.graph.nodes.forEach((point, index) => {
      const circle = this.group.append('g');
      // const xRange = this.animateRange(point.x);
      // const yRange = this.animateRange(point.y);

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
}
