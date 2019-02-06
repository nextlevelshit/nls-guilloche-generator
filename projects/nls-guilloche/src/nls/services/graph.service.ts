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

  public getIndexById(graphId: string): number {
    return this.graphs.findIndex(graph => {
      return graph.id === graphId;
    });
  }

  public *spreadOrthogonal(
    start: Point,
    spacing: number,
    radians?: number
  ) {
    const sign = this.math.flipSign();
    let point = start;
    let i = 0;

    radians = (radians)
      ? radians
      : (point.radians)
        ? point.radians
        : this.math.randomFloat(0, 2);

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
