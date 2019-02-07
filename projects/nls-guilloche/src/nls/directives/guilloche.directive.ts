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

import { ElementRef, HostListener, Input, Directive, OnChanges, OnDestroy, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as Selection from 'd3-selection';
import * as Shape from 'd3-shape';
import * as Random from 'd3-random';
import * as Drag from 'd3-drag';
import * as Ease from 'd3-ease';
import * as Timer from 'd3-timer';
import * as Interpolation from 'd3-interpolate';
import 'd3-transition';

import { Graph } from './../models/graph.model';
import { Point } from './../models/point.model';
import { NlsMathService } from './../services/math.service';
import { NlsGraphService } from '../services/graph.service';

// const CURVE_SHAPE = Shape.curveCatmullRom;
const CURVE_SHAPE = Shape.curveBundle.beta(1);
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
  private radians: number;

  @Input() graph: Graph;
  @Output() refreshed = new EventEmitter();

  constructor(
    private el: ElementRef,
    private math: NlsMathService,
    private graphService: NlsGraphService
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initGroup(); // Prepare canvas and group
    this.initCurve(); // Generate curve from graph
    this.calculateMedian(); // Calculate median of graph
    this.spreadCurve(); // Spread generated curve to many

    if (this.graph.animation.enabled) {
      this.refreshPaths();
    } else {
      this.initPaths();
    }
  }

  ngOnDestroy() {
    this.clearCanvas();
  }

  private initPaths(): void {
    this.clearCanvas();
    this.appendPaths();
  }

  private clearCanvas(): void {
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
  private initGroup(): void {
    if (!this.group) {
      // init SVG
      this.group = Selection.select(this.el.nativeElement);
      // Set configuration of handed in graph
      this.group
        .attr('stroke', this.graph.color)
        .attr('stroke-width', this.graph.stroke)
        .attr('fill', 'none');
    }
  }

  /**
   * Initiate the curve from graph input.
   * Gather all points in the right order and calculate
   * the median point and index for later usage to spread
   * curves on the axis of medians' radians.
   */
  private initCurve(): void {
    this.initialCurve = this.graphService.getCurve(this.graph);
  }

  private calculateMedian(): void {
    this.medianPoint = this.math.medianOfCurve(this.initialCurve);
    this.medianIndex = this.math.medianIndex(this.initialCurve);
  }

  /**
   * Take graph and spread median points orthogonal to medians
   * radians by specific amount of times. Amount of spreaded
   * curves can be set inside graph parameters.
   */
  private spreadCurve(): void {
    const medians = [];
    const preMedians = [];
    const postMedians = [];

    const shiftMedian = this.graphService.spreadOrthogonal(
      this.initialCurve[this.medianIndex],
      this.graph.spread.spacing
    );

    const shiftPreMedian = this.graphService.spreadOrthogonal(
      this.initialCurve[this.medianIndex - 1],
      this.graph.spread.spacing * 0.8
    );
    const shiftPostMedian = this.graphService.spreadOrthogonal(
      this.initialCurve[this.medianIndex + 1],
      this.graph.spread.spacing * 0.8
    );

    for (let i = 0; i < this.graph.spread.amount; i++) {
      medians.push(shiftMedian.next().value);

      if (this.graph.nodes.length > 3) {
        preMedians.push(shiftPreMedian.next().value);
        postMedians.push(shiftPostMedian.next().value);
      }
    }

    this.curveList = medians.map((median, i) => {
      const shiftedPoints = this.initialCurve.slice();

      shiftedPoints.splice(this.medianIndex, 1, median);

      if (this.graph.nodes.length > 3) {
        shiftedPoints.splice(this.medianIndex - 1, 1, preMedians[i]);
        shiftedPoints.splice(this.medianIndex + 1, 1, postMedians[i]);
      }

      return shiftedPoints;
    });
  }

  /**
   * Iterate through generated curve list and append for
   * each curve a new path to the SVG group.
   */
  private appendPaths(): void {
    const transitionFinished = this.transitionFinished();

    this.curveList.map(curve => {
      this.pathList.push(
        this.group.append('path')
          .attr('d', Shape.line()
            .x(p => p.x)
            .y(p => p.y)
            .curve(CURVE_SHAPE)(curve)
          )
      );
      transitionFinished.next();
    });
  }

  /**
   * Update existing paths with transition
   */
  private refreshPaths(): void {
    this.curveList.forEach((curve, i) => {
      this.pathList[this.curveList.length - i - 1]
        .attr('d', Shape.line()
          .x(p => p.x)
          .y(p => p.y)
          .curve(CURVE_SHAPE)(curve)
        );
    });
  }

  private curveGeneratorList() {
    return this.curveList.map(curve => {
      this.generateCurve(curve);
    });
  }

  private *generateCurve(curve: Point[]) {
    while (true) {
      yield;

    }
  }

  private *transitionFinished() {
    let cycle = 1;

    while (true) {
      if (cycle % this.curveList.length === 0) {
        this.refreshed.emit(this.graph.id);
      }
      yield cycle++;
    }
  }

  private debugGraph(): void {
    if (this.graph.debug) {
      this.group.selectAll('circle').remove();
      this.curveList.map(curve => this.debugCurve(curve));
    }
  }

  private debugCurve(points: Point[]) {
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

