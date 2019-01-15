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

import { ElementRef, HostListener, Input, Directive, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import * as Selection from 'd3-selection';
import * as Shape from 'd3-shape';
import * as Random from 'd3-random';
import * as Drag from 'd3-drag';
import * as Ease from 'd3-ease';
import * as Timer from 'd3-timer';
import 'd3-transition';

import { Graph } from './../models/graph.model';
import { Point } from './../models/point.model';
import { NlsMathService } from './../services/math.service';
import { NlsGraphService } from '../services/graph.service';

// const CURVE_SHAPE = Shape.curveCardinal.tension(0.1);
// const CURVE_SHAPE = Shape.curveCatmullRom.alpha(1);
const CURVE_SHAPE = Shape.curveBundle.beta(0.9);
// const CURVE_SHAPE = Shape.curveBasis;

@Directive({
  selector: '[nlsGuilloche]'
})
export class NlsGuillocheDirective implements OnChanges, OnDestroy {

  private group: Selection;
  private initialCurve: Point[]; // generated from graph
  private medianPoint: Point; // generated from initialCurve
  private medianIndex: number; // generated from initialCurve
  private curveList: Point[][]; // generated from initialCurve
  private pathList: any; // generated from curveList

  @Input() graph: Graph;
  @Input() animation: boolean;

  constructor(
    private el: ElementRef,
    private math: NlsMathService,
    private graphService: NlsGraphService,
    private mathService: NlsMathService
  ) {
  }

  ngOnDestroy() {
    this.clearSVG();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initSVG(); // Prepare canvas and group
    this.initInitialCurve(); // Generate curve from graph
    this.spreadInitialCurve(); // Spread generated curve to many

    if (this.animation) {
      const duration = this.math.randomInt(1800, 2000);
      const amplitude = this.math.randomInt(20, 60);
      const shift = this.math.randomFloat(0, 2);

      if (!this.pathList) {
        this.clearSVG();
        this.drawPaths();
      }

      for (let i = 0; i < this.graph.spread.amount; i++) {
        this.animatePath(
          this.pathList[i],
          this.curveList[i],
          duration,
          amplitude,
          shift
        );
      }
    } else {
      if (changes.graph
        && (changes.graph.firstChange
          || this.graphNodesChanged(
            changes.graph.previousValue,
            changes.graph.currentValue
          )
        )
      ) {
        this.clearSVG();
        this.drawPaths();
      } else {
        this.updatePaths();
      }
    }
    if (this.graph.debug) {
      this.group.selectAll('circle').remove();
      this.curveList.map(curve => this.debugGraph(curve));
    }
  }

  private clearSVG(): void {
    this.group.selectAll('*').remove();
    this.pathList = [];
  }

  private graphNodesChanged(prev, current): boolean {
    return prev.nodes.length !== current.nodes.length
      || prev.spread.amount !== current.spread.amount;
  }

  /**
   * Clean up existing groups, paths and points.
   * Specify where to append the generated curves.
   */
  private initSVG(): void {
    // init SVG
    this.group = Selection.select(this.el.nativeElement);
    // Set configuration of handed in graph
    this.group
      .attr('stroke', this.graph.color)
      .attr('stroke-width', this.graph.stroke)
      .attr('fill', 'none');
  }

  /**
   * Initiate the initial curve from handed in graph.
   * Gather all points in the right order and calculate
   * the median point and index for later usage to spread
   * curves on the axis of medians' ascent.
   */
  private initInitialCurve(): void {
    this.initialCurve = [
      this.graph.start.point,
      this.graph.start.direction,
      ...this.graph.nodes.slice(),
      this.graph.end.direction,
      this.graph.end.point
    ];
    this.medianPoint = this.math.medianOfCurve(this.initialCurve);
    this.medianIndex = this.math.medianIndex(this.initialCurve);
  }

  /**
   * Take graph and spread median points orthogonal to medians
   * ascent by specific amount of times. Amount of spreaded
   * curves can be set inside graph parameters.
   */
  private spreadInitialCurve(): void {
    const spreadCurveList = [];
    const shiftedMedians = [];
    const genshiftedMedians = this.graphService.spreadOrthogonal(this.medianPoint, this.graph.spread.spacing);

    for (let i = 0; i < this.graph.spread.amount; i++) {
      shiftedMedians.push(genshiftedMedians.next().value);
    }

    this.curveList = shiftedMedians.map(median => {
      const shiftedPoints = this.initialCurve.slice();
      shiftedPoints.splice(this.medianIndex, 1, median);
      return shiftedPoints;
    });
  }

  /**
   * Iterate through generated curve list and append for
   * each curve a new path to the SVG group.
   */
  private drawPaths(): void {
    this.curveList.map(curve => {
      this.pathList.push(
        this.group.append('path')
          .attr('d', Shape.line()
            .x(p => p.x)
            .y(p => p.y)
            .curve(CURVE_SHAPE)(curve)
          )
      );
    });
  }

  /**
   * Update existing paths with transition
   */
  private updatePaths(): void {
    for (let i = 0; i < this.graph.spread.amount; i++) {
      this.pathList[i]
        .transition()
        .duration(2000)
        .ease(Ease.easeExpInOut)
        .attr('d', Shape.line()
          .x(p => p.x)
          .y(p => p.y)
          .curve(CURVE_SHAPE)(this.curveList[i]));
    }
  }

  private animatePath(path: any, curve: Point[], duration: number, amplitude: number, shift: number = 0): void {
    const easeIn = Ease.easeQuadIn;
    const easeOut = Ease.easeQuadOut;

    path
      .transition()
      .duration(duration)
      .ease(easeOut)
      .attr('d', Shape.line()
        .x(p => p.x)
        .y(p => p.y)
        .curve(CURVE_SHAPE)(this.shiftCurve(curve, amplitude, shift)))
      .transition()
      .duration(duration)
      .ease(easeIn)
      .attr('d', Shape.line()
        .x(p => p.x)
        .y(p => p.y)
        .curve(CURVE_SHAPE)(this.shiftCurve(curve, 0, shift)))
      .transition()
      .ease(easeOut)
      .duration(duration)
      .attr('d', Shape.line()
        .x(p => p.x)
        .y(p => p.y)
        .curve(CURVE_SHAPE)(this.shiftCurve(curve, -amplitude, shift)))
      .transition()
      .ease(easeIn)
      .duration(duration)
      .attr('d', Shape.line()
        .x(p => p.x)
        .y(p => p.y)
        .curve(CURVE_SHAPE)(this.shiftCurve(curve, 0, shift)))
      .on('end', () => {
        if (this.animation) {
          this.animatePath(path, curve, duration, amplitude, shift);
        }
      });
  }

  private shiftCurve(curve: Point[], amplitude: number, shift: number = 0): Point[] {
    const curveCopy = Object.assign([], curve);
    const sign = this.math.flipSign();
    const start = curveCopy.splice(0, 2);
    const end = curveCopy.splice(-2, 2);

    return [
      ...start,
      ...curveCopy.map(point => this.graphService.shiftPoint(
        point,
        amplitude * sign.next().value,
        shift
      )),
      ...end
    ];
  }

  private drawGraph(points: Point[]): void {
    this.pathList.push(
      this.group.append('path')
        .attr('d', Shape.line()
          .x(p => p.x)
          .y(p => p.y)
          .curve(CURVE_SHAPE)(points)
        )
      );
  }

  private debugGraph(points: Point[]) {
    points.forEach((point, index) => this.debugPoint(point));
  }

  private debugPoint(point: Point, opacity: number = 0.1): void {
    this.group.append('circle')
      .attr('cx', point.x)
      .attr('cy', point.y)
      .attr('r', 4)
      .attr('stroke-width', 0)
      .attr('fill-opacity', opacity)
      .attr('fill', this.graph.color);
  }
}
