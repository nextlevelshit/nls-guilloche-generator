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

import { ViewChildren, QueryList, Component, AfterViewInit, ViewChild, Input, SimpleChanges, OnChanges, HostListener } from '@angular/core';
import * as Selection from 'd3-selection';
import * as Shape from 'd3-shape';
import * as Random from 'd3-random';
import * as Drag from 'd3-drag';

import { environment as env } from '../../environments/environment';
import { GuillocheDirective } from './../directives/guilloche.directive';
import { CanvasService } from './../services/canvas.service';
import { Graph } from '../models/graph.model';
import { Point } from '../models/point.model';

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class GraphsComponent implements AfterViewInit, OnChanges {

  public graphs: Graph[];
  public canvas: any | null;
  public matrix: any | null;

  private genShiftPoint: any | null;

  @Input() config: any;

  @ViewChild('svg') svgElementRef;
  @ViewChild(GuillocheDirective) guillocheViewChild: GuillocheDirective;
  @ViewChildren(GuillocheDirective) guillocheViewChildren: QueryList<GuillocheDirective>;

  @HostListener('window:resize', ['$event'])
  private onResize(event) {
    this.init();
  }

  constructor(
    private canvasService: CanvasService
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('graph component (changes:config)', changes.config.currentValue);
    this.init();
  }

  /**
   * @todo Will deprecate if there won't be any use for this
   */
  ngAfterViewInit() {
    console.log('graph component (afterView:children)', this.guillocheViewChildren.toArray());
  }

  private init() {
    this.updateCanvas();
    this.updateMatrix();
    this.updateGraphs();
  }

  private updateGraphs(): void {
    const curves = [
      {
        start: {
          point: this.matrix['start'],
          vector: this.config.vectors.start,
          color: env.guilloche.colors.start
        },
        end: {
          point: this.matrix['end'],
          vector: this.config.vectors.end,
          color: env.guilloche.colors.end
        }
      },
      {
        start: {
          point: this.matrix['end'],
          vector: this.config.vectors.start,
          color: env.guilloche.colors.end
        },
        end: {
          point: this.matrix['start'],
          vector: this.config.vectors.end,
          color: env.guilloche.colors.start
        }
      }
    ];

    this.graphs = [this.adjustGraph(curves[0]), this.adjustGraph(curves[1])];
    console.log('graphs component (updateGraphs):', this.graphs);
  }

  private adjustGraph(curve) {
    const expandedPoints = [];

    for (let i = 0; i < this.config.nodes; i++) {
      expandedPoints.push(this.randomPoint);
    }

    return {
      id: `start-to-end`,
      start: {
        coords: curve.start.point,
        direction: curve.start.vector,
        color: curve.start.color
      }, end: {
        coords: curve.end.point,
        direction: curve.end.vector,
        color: curve.end.color
      },
      stroke: this.config.stroke,
      nodes: [
        this.vectorPoint(curve.start.point, curve.start.vector),
        ...expandedPoints,
        this.vectorPoint(curve.end.point, curve.end.vector)
      ]
    };
  }

  private flipflop(x: string) {
    return (x === 'start') ? 'end' : 'start';
  }

  private updateCanvas(): void {
    this.canvas = this.svgElementRef.nativeElement;
    this.canvasService.set(this.canvas);
  }

  private centerPoint(width, height): Point {
    return {
      x: width * 0.5,
      y: height * 0.5
    };
  }

  private updateMatrix() {
    const totalArea = Math.abs(this.canvas.clientWidth * this.canvas.clientHeight);
    const totalCenter = this.centerPoint(this.canvas.clientWidth, this.canvas.clientHeight);

    const baseArea = Math.abs(this.config.width * this.config.height);
    const baseScale = Math.pow(totalArea / baseArea * this.config.scale, 0.5);
    const baseWidthScaled = baseScale * this.config.width;
    const baseHeightScaled = baseScale * this.config.height;
    const baseCenter = this.centerPoint(baseWidthScaled, baseHeightScaled);

    this.matrix = {
      start: {
        x: totalCenter.x - baseCenter.x,
        y: totalCenter.y + baseCenter.y
      },
      end: {
        x: totalCenter.x + baseCenter.x,
        y: totalCenter.y - baseCenter.y
      },
      width: baseWidthScaled,
      height: baseHeightScaled,
      center: totalCenter
    };
  }

  private vectorPoint(point: Point, direction: number) {
    const range = this.Δ(this.matrix.start, this.matrix.end) * this.config.vectors.range;

    return {
      x: range * Math.sin(Math.PI * direction) + point.x,
      y: range * Math.cos(Math.PI * direction) + point.y
    };
  }

  private get randomPoint() {
    const overlap = this.config.overlap;
    const x = {
      min: this.matrix.center.x - this.matrix.width * overlap,
      max: this.matrix.center.x + this.matrix.width * overlap
    };
    const y = {
      min: this.matrix.center.y - this.matrix.height * overlap,
      max: this.matrix.center.y + this.matrix.height * overlap
    };

    console.log(this.matrix.center);

    return {
      x: Random.randomUniform(x.min, x.max)(),
      y: Random.randomUniform(y.min, y.max)()
    };
  }

  /**
   * Calculate distance between to points with coordinates.
   * @param a
   * @param b
   */
  private Δ(a: Point, b: Point) {
    return Math.pow(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2), 0.5);
  }



  private *shiftPoint(point: Point, direction) {
    const genShiftX = this.shiftNumber(this.config.space, point.x);
    const genShiftY = this.shiftNumber(this.config.space, point.y);

    return {
      x: 0,
      y: 0
    };
  }

  private *shiftNumber(num: number, space: number) {
    let current = num;
    let index = 0;
    const sign = this.flipSign();

    while (true) {
      yield current = sign.next().value * index * space + current;
      index++;
    }
  }

  private *flipSign() {
    let sign = 1;

    while (true) {
      yield sign = sign * (-1);
    }
  }
}
