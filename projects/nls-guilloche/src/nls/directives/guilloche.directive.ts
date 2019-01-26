import { Output, EventEmitter } from '@angular/core';
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
import * as Interpolation from 'd3-interpolate';
import 'd3-transition';

import { Graph } from './../models/graph.model';
import { Point } from './../models/point.model';
import { NlsMathService } from './../services/math.service';
import { NlsGraphService } from '../services/graph.service';

// const CURVE_SHAPE = Shape.curveMonotoneY;
// const CURVE_SHAPE = Shape.curveBundle;
// const CURVE_SHAPE = Shape.curveBundle.beta(0.9);
// const CURVE_SHAPE = Shape.curveCardinal.tension(0);
// const CURVE_SHAPE = Shape.curveCatmullRom;
// const CURVE_SHAPE = Shape.curveCatmullRom.alpha(0);
// const CURVE_SHAPE = Shape.curveBundle.beta(0.9);
const CURVE_SHAPE = Shape.curveBasis;
const DEFAULT_DURATION = 1200;
const DEFAULT_EASE = Ease.easePolyInOut;
const ANIMATION_EASE = Ease.easePolyInOut.exponent(1.6);
// const ANIMATION_EASE = Ease.easeBackInOut.overshoot(2);
// const ANIMATION_EASE = Ease.easeBackOut.overshoot(100);
// const ANIMATION_EASE = Ease.easeSinInOut;

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
  private interval: any;
  private ascent: number;

  @Input() graph: Graph;
  @Input() animation: boolean;
  @Output() updated = new EventEmitter();

  constructor(
    private el: ElementRef,
    private math: NlsMathService,
    private graphService: NlsGraphService
  ) {
  }

  ngOnDestroy() {
    this.clearSVG();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initSVG(); // Prepare canvas and group
    this.initInitialCurve(); // Generate curve from graph
    this.spreadInitialCurve(); // Spread generated curve to many
    this.ascent = this.math.randomFloat(0, 2);

    if (this.animation) {
      if (!this.pathList) {
        this.clearSVG();
        this.appendPaths();
      }
      this.initFirstAnimation();
      this.setAnimationInterval();
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
        this.appendPaths();
      } else {
        if (this.interval) {
          this.interval.stop();
        }
        this.refreshPaths();
      }
    }
  }

  private setAnimationInterval(): void {
    this.interval = Timer.interval((t) => {
      this.animateGraph();
    }, this.graph.animation.interval);
  }

  private initFirstAnimation(): void {
    this.prepareNextAnimationStep();
    this.animateGraph();
  }

  private prepareNextAnimationStep(): void {
    const nextNodes = this.graph.nodes.map(p => {
      const n = {
        x: p.x + Random.randomNormal(1, 2)() * this.graph.animation.shift,
        y: p.y + Random.randomNormal(0.3, 3)() * this.graph.animation.shift,
        ascent: (p.ascent) ? p.ascent : null
      };
      return n;
    });
    this.initInitialCurve(nextNodes);
    this.spreadInitialCurve();
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
  private initInitialCurve(nodes: Point[] = this.graph.nodes): void {
    this.initialCurve = [
      this.graph.start.point,
      this.graph.start.direction,
      ...nodes.slice(),
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
    const medians = [];
    const preMedians = [];
    const postMedians = [];

    const shiftMedian = this.graphService.spreadOrthogonal(
      this.initialCurve[this.medianIndex],
      this.graph.spread.spacing,
      this.ascent * Random.randomNormal(1, 0.05)()
    );

    const shiftPreMedian = this.graphService.spreadOrthogonal(
      this.initialCurve[this.medianIndex - 1],
      this.graph.spread.spacing * 0.5,
      this.ascent * Random.randomNormal(1, 0.05)()
    );
    const shiftPostMedian = this.graphService.spreadOrthogonal(
      this.initialCurve[this.medianIndex + 1],
      this.graph.spread.spacing * 0.5,
      this.ascent * Random.randomNormal(1, 0.05)()
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
    this.curveList.map(curve => {
      this.pathList.push(
        this.group.append('path')
          .datum({points: curve})
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
  private refreshPaths(
    duration = DEFAULT_DURATION,
    ease = DEFAULT_EASE
  ): void {
    const transitionFinished = this.transitionFinished();

    this.pathList.forEach((path, i) => {
      const nextCurve = this.curveList[i];

      path
        .transition()
        .duration(duration)
        .ease(ease)
        .attrTween('d', function(curve) {
          const interpolate = Interpolation.interpolateArray(
            curve.points,
            nextCurve
          );

          return (t) => {
            curve.points = interpolate(t);

            return Shape.line()
              .x((p, index, arr) => {
                return p.x;
              })
              .y((p, index, arr) => {
                return p.y;
              })
              .curve(CURVE_SHAPE)(curve.points);
          };
        })
        .on('end', () => {
          transitionFinished.next();
        });
    });
  }

  private animateGraph(): void {
    this.refreshPaths(
      this.graph.animation.interval,
      ANIMATION_EASE
    );
    this.prepareNextAnimationStep();
    this.debugGraph();
  }

  private *transitionFinished() {
    let cycle = 1;

    while (true) {
      if (cycle % this.curveList.length === 0) {
        this.updated.emit(true);
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
