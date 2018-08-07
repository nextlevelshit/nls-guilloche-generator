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

@Injectable()
export class ArithmeticService {

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

  public centerPoint(width, height): Point {
    return {
      x: width * 0.5,
      y: height * 0.5
    };
  }
}
