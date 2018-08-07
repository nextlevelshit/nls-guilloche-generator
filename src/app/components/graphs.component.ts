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

import { ViewChild, Component, Input, Output, SimpleChanges, OnChanges, EventEmitter, OnInit } from '@angular/core';
import { Observable, interval, Subscription } from 'rxjs';
import * as Selection from 'd3-selection';
import * as Shape from 'd3-shape';
import * as Random from 'd3-random';
import * as Drag from 'd3-drag';

import { environment as env } from '../../environments/environment';
import { CanvasService } from './../services/canvas.service';
import { HistoryService } from './../services/history.service';
import { AnimationService } from '../services/animation.service';
import { ArithmeticService } from '../services/arithmetic.service';
import { GuillocheDirective } from './../directives/guilloche.directive';
import { Graph } from '../models/graph.model';
import { Point } from '../models/point.model';

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class GraphsComponent implements OnChanges, OnInit {

  public canvas: any | null;
  public matrix: any | null;
  public graphs: Graph[];

  private genShiftPoint: any | null;
  private genLoadedAllGraphs: any | null;
  private hash: string;
  private animation: Observable<Graph[]>;
  private timer: Observable<number>;
  private animationSteps: Subscription;

  @Input() config: any;
  @Input() restoredHistory: any;
  @Input() animationActive: boolean;
  @Output() svgChange = new EventEmitter();
  @Output() graphChange = new EventEmitter();
  @ViewChild('svg') svgElementRef;

  constructor(
    private canvasService: CanvasService,
    private historyService: HistoryService,
    private animationService: AnimationService,
    private arithmetics: ArithmeticService
  ) {
    this.genLoadedAllGraphs = this.countLoadedGraphs();
    this.timer = interval(500);
  }

  ngOnInit() {
    this.updateGraphs();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateCanvas();
    this.updateMatrix();

    if (changes.config && !changes.config.firstChange) {
      this.updateGraphs();
      return;
    }

    if (this.restoredHistory && this.restoredHistory.hash !== this.hash) {
      this.graphs = this.restoredHistory.graphs;
      this.hash = this.restoredHistory.hash;
    }

    if (changes.animationActive) {
      if (this.animationActive) {
        this.animationSteps = this.timer.subscribe(n => {
          console.log('Animation step', n);
          this.graphs = this.animationService.animate(this.graphs);
          // this.graphs = this.graphs;
          this.hash = this.historyService.hash(this.graphs);
          this.saveHistory();
        });
      } else {
        if (this.animationSteps) {
          this.animationSteps.unsubscribe();
        }
      }
    }
  }

  private saveHistory() {
    this.historyService.save(this.graphs, this.config);
  }

  private updateGraphs(): void {
    const genShiftStart = this.shiftPoint(this.matrix.start, this.config.vectors.start);
    const genShiftEnd = this.shiftPoint(this.matrix.end, this.config.vectors.end);

    const curveList = [
      {
        color: env.guilloche.colors.primary,
        start: genShiftStart.next().value,
        end: genShiftEnd.next().value
      },
      {
        color: env.guilloche.colors.secondary,
        start: genShiftEnd.next().value,
        end: genShiftStart.next().value
      }
    ];

    this.graphs = curveList.map(curve => this.adjustGraph(curve));
    this.hash = this.historyService.hash(this.graphs);
    this.saveHistory();
  }

  private adjustGraph(curve) {
    return Object.assign(curve, {
      stroke: this.config.stroke,
      nodes: [
        this.genVectorPoint(curve.start.point, curve.start.vector),
        ...this.genRandomPoints(this.config.nodes),
        this.genVectorPoint(curve.end.point, curve.end.vector)
      ]
    });
  }

  private genRandomPoints(num: number) {
    const generatedPoints = [];

    for (let i = 0; i < this.config.nodes; i++) {
      generatedPoints.push(this.arithmetics.randomPoint(this.matrix, this.config.overlap));
    }

    return generatedPoints;
  }

  private flipflop(x: string) {
    return (x === 'start') ? 'end' : 'start';
  }

  private updateCanvas(): void {
    this.canvas = this.svgElementRef.nativeElement;
    this.canvasService.set(this.canvas);
  }

  private updateMatrix() {
    const totalArea = Math.abs(this.canvas.clientWidth * this.canvas.clientHeight);
    const totalCenter = this.arithmetics.centerPoint(this.canvas.clientWidth, this.canvas.clientHeight);

    const baseArea = Math.abs(this.config.width * this.config.height);
    const baseScale = Math.pow(totalArea / baseArea * this.config.scale, 0.5);
    const baseWidthScaled = baseScale * this.config.width;
    const baseHeightScaled = baseScale * this.config.height;
    const baseCenter = this.arithmetics.centerPoint(baseWidthScaled, baseHeightScaled);

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

  private genVectorPoint(point: Point, vector: number) {
    const range = this.arithmetics.Δ(this.matrix.start, this.matrix.end) * this.config.vectors.range;

    return {
      x: range * Math.sin(Math.PI * vector) + point.x,
      y: range * Math.cos(Math.PI * vector) + point.y
    };
  }

  private *shiftPoint(point: Point, vector) {
    const genShiftX = this.shiftNumber(this.config.space, vector);
    const genShiftY = this.shiftNumber(this.config.space, vector);

    while (true) {
      yield {
        point: {
          x: Math.cos(Math.PI * vector) * genShiftX.next().value + point.x,
          y: Math.sin(Math.PI * vector) * genShiftY.next().value + point.y,
        },
        vector: vector
      };
    }
  }

  private *shiftNumber(space: number, vector: number) {
    let current = 0;
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

  public prepareGuillocheExport(guillocheElement) {
    if (this.genLoadedAllGraphs.next().value) {
      this.svgChange.emit(this.svgElementRef);
    }
  }

  private *countLoadedGraphs() {
    let cycles = 1;

    while (true) {
      if (cycles < this.graphs.length) {
        yield false;
        cycles++;
      } else {
        yield true;
        cycles = 1;
      }
    }
  }
}
