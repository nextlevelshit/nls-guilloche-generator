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

import { Inject, Injectable } from '@angular/core';
import * as Selection from 'd3-selection';
import * as Random from 'd3-random';

import { Point } from './../models/point.model';
import { Graph } from './../models/graph.model';

@Injectable()
export class MathService {

  /**
   * Calculate distance between to points with coordinates.
   * @param a
   * @param b
   */
  public Δ(a: Point, b: Point) {
    return Math.pow(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2), 0.5);
  }

  public getClosestCenter(point: Point, matrix: any) {
    if (this.Δ(point, matrix.start) < this.Δ(point, matrix.end)) {
      return matrix.start;
    } else {
      return matrix.end;
    }
  }

  public getFarestCenter(point: Point, matrix: any) {
    if (this.Δ(point, matrix.start) > this.Δ(point, matrix.end)) {
      return matrix.start;
    } else {
      return matrix.end;
    }
  }

  public randomPoint(matrix: any, overlap: number) {
    const x = {
      min: matrix.center.x - matrix.width * overlap,
      max: matrix.center.x + matrix.width * overlap
    };
    const y = {
      min: matrix.center.y - matrix.height * overlap,
      max: matrix.center.y + matrix.height * overlap
    };

    return {
      x: Random.randomUniform(x.min, x.max)(),
      y: Random.randomUniform(y.min, y.max)()
    };
  }

  public centerOfArea(width, height): Point {
    return {
      x: width * 0.5,
      y: height * 0.5
    };
  }

  public centerOfPoints(p1: Point, p2: Point) {
    return {
      x: (p1.x + p2.x) * 0.5,
      y: (p1.y + p2.y) * 0.5
    };
  }

  public centerOfCurve(curve: Point[]) {
    const genMedian = this.medianPoint(curve);
    const p1 = genMedian.next().value;
    const p2 = genMedian.next().value;
    const radians = this.angleRadians(p1, p2);

    return Object.assign(this.centerOfPoints(p1, p2), { ascent: radians });
  }

  public angleRadians(p1: Point, p2: Point) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  public angleDegree(p1: Point, p2: Point) {
    return this.angleRadians(p1, p2) * 180 / Math.PI;
  }

  public medianIndex(list: any): number {
    return Math.floor(list.length * 0.5);
  }

  public *medianPoint(points: Point[]) {
    let index: number;
    const list: Point[] = points.slice();

    while (list) {
      index = this.medianIndex(points);
      yield list[index];

      list.splice(index, 1);
    }
  }

  public *flipSign() {
    let sign = 1;

    while (true) {
      yield sign = sign * (-1);
    }
  }
}
