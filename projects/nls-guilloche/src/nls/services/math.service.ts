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

export enum DEFAULTS {
  ENTROPY = 0.8
}

@Injectable()
export class NlsMathService {

  private randomRadians(): number {
    return this.randomFloat(0, 2 * Math.PI);
  }

  private relatedRadians(parentRadians: number): number {
    return Random.randomNormal(parentRadians, DEFAULTS.ENTROPY)();
  }

  private calcAcceleration(
    childRadians: number,
    parentRadians: number
  ): number {
    return 1 - this.minimumDifference(childRadians, parentRadians) / Math.PI;
  }

  private minimumDifference(a: number, b: number): number {
    return Math.min((2 * Math.PI) - Math.abs(a - b), Math.abs(a - b));
  }

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

  public randomPoint(
    matrix: any,
    overlap: number,
    parent?: Point,
    radius?: number
  ): Point {
    let point: Point;

    if (parent && radius) {
      const radians = this.relatedRadians(parent.radians);
      const acceleration = this.calcAcceleration(radians, parent.radians);
      const velocity = radius * acceleration;

      point = {
        x: Math.sin(radians * Math.PI) * velocity + parent.x,
        y: Math.cos(radians * Math.PI) * velocity + parent.y
      };
    } else {
      point = {
        x: Random.randomNormal(matrix.center.x, matrix.width * 0.5 * overlap)(),
        y: Random.randomNormal(matrix.center.y, matrix.height * 0.5 * overlap)()
      };
    }

    return {
      x: point.x,
      y: point.y,
      distanceToCenter: this.Δ(point, matrix.center)
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

    return Object.assign(this.centerOfPoints(p1, p2), { radians: radians });
  }

  public medianOfCurve(curve: Point[]) {
    // const genMedian = this.medianPoint(curve);
    // const p1 = genMedian.next().value;
    // const p2 = genMedian.next().value;
    // const p3 = genMedian.next().value;
    // const radians = this.angleRadians(p2, p3);
    const index = this.medianIndex(curve);

    return curve[index];
  }

  public angleRadians(p1: Point, p2: Point) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  public angleDegree(p1: Point, p2: Point) {
    return this.angleRadians(p1, p2) * 180 / Math.PI;
  }

  public medianIndex(list: any): number {
    return Math.round(list.length * 0.5);
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

  /**
   * Generator for sine bounce
   *
   * @param start 0 indicates to initiate with positive numbers, 1 indicates to
   * start with negative numbers first
   * @param amplitude default to 1 indicates the amplitude in positive as well
   * in negative tension
   * @param decimals amount of decimal places
   */

  public *bounce(
    amplitude: number = 1,
    decimals: number = 1,
    start: number = 0
  ) {
    const power = Math.pow(10, decimals);
    const step = 2 / (power);
    let index = 0;

    while (true) {
      const radians = Math.PI * step * index + start;
      yield Math.round((Math.sin(radians) * amplitude) * power) / power;

      index++;
    }
  }

  public *flipSign(startPositive: boolean = true) {
    let sign = startPositive ? 1 : -1;

    while (true) {
      yield sign = sign * (-1);
    }
  }

  /**
   * Get a random floating point number between `min` and `max`.
   *
   * @param min - min number
   * @param max - max number
   * @return a random floating point number
   */
  public randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Get a random integer between `min` and `max`.
   *
   * @param min - min number
   * @param max - max number
   * @return a random integer
   */
  public randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * Get a random boolean value.
   *
   * @return a random true/false
   */
  public getRandomBool(): boolean {
    return Math.random() >= 0.5;
  }
}
