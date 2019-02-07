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

import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import * as Selection from 'd3-selection';
import * as Random from 'd3-random';
import * as Array from 'd3-array';

import { NlsMathService } from './math.service';
import { Graph } from './../models/graph.model';
import { Point } from './../models/point.model';

@Injectable()
export class NlsGraphService {
  private graphs: Graph[];
  private animation: boolean | null;

  constructor(
    private math: NlsMathService
  ) {}

  public get() {
    return this.graphs;
  }

  public set(newGraphs: Graph[]) {
    this.graphs = newGraphs;
  }

  public get isAnimated() {
    return this.animation;
  }

  public startAnimation() {
    this.animation = true;
  }

  public stopAnimation() {
    this.animation = false;
  }

  public getById(graphId: string): Graph | undefined {
    return this.graphs.find(graph => {
      return graph.id === graphId;
    });
  }

  public getCurve(graph: Graph): Point[] {
    return [
      graph.start.point,
      graph.start.direction,
      ...graph.nodes,
      graph.end.direction,
      graph.end.point
    ];
  }

  public getIndexById(graphId: string): number {
    return this.graphs.findIndex(graph => {
      return graph.id === graphId;
    });
  }

  public *pointsOnPath(
    path: any,
    ticksAverage: number = 1200,
    clockwise: boolean = Math.random() >= 0.5,
    start: number = Math.random()
  ) {
    const totalLength = path.getTotalLength();
    // const ticks = ticksAverage;
    const ticks = Math.floor(ticksAverage + ticksAverage * Random.randomNormal(0, 0.2)());
    const direction = (clockwise) ? totalLength : 0;

    const pointsList = Array.range(ticks).map((i) => {
      const step = i * totalLength / ticks;
      return path.getPointAtLength(Math.abs(direction - step));
    });

    let i = Math.floor(start * totalLength);

    while (true) {
      yield pointsList[i++ % ticks];
    }
  }

  public *spreadOrthogonal(
    start: Point,
    spacing: number,
    radians?: number
  ) {
    const sign = this.math.flipSign();
    let point = start;
    let i = 0;

    radians = (radians || radians === 0)
      ? radians
      : (point.radians)
        ? point.radians
        : this.math.randomFloat(0, 2);

        // console.log(point.radians);

    // radians = this.math.randomFloat(0, 2);


    while (true) {
      const nextSpacing = sign.next().value * spacing * i;

      point = this.shiftPoint(point, nextSpacing, radians);
      yield point;
      // spacing *= 0.99;
      // spacing *= 1.01;
      i++;
    }
  }

  public shiftPoint(
    point: Point,
    spacing: number,
    radians?: number
  ): Point {
    radians = radians ? radians : this.math.randomFloat(0, 2);
    return {
      x: Math.sin(radians * Math.PI) * spacing + point.x,
      y: Math.cos(radians * Math.PI) * spacing + point.y
    };
  }
}
