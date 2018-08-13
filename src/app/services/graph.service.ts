import { Validators } from '@angular/forms';
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

import { MathService } from './math.service';
import { Graph } from './../models/graph.model';
import { Point } from './../models/point.model';

@Injectable()
export class GraphService {
  private graphs: Graph[];
  private animation: boolean | null;

  constructor(
    private math: MathService
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

  public *spreadOrthogonal(start: Point, spacing: number) {
    const sign = this.math.flipSign();
    let currentPoint = start;
    let i = 0;

    while (true) {
      const currentSpacing = sign.next().value * spacing * i;
      currentPoint = this.shiftPoint(currentPoint, start.ascent, currentSpacing);

      yield currentPoint;

      i++;
    }
  }

  public shiftPoint(point: Point, radians: number, spacing: number) {
    return {
      x: Math.sin(radians * Math.PI) * spacing + point.x,
      y: Math.cos(radians * Math.PI) * spacing + point.y
    };
  }
}
