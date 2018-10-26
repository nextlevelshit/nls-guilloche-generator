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

import { ViewChild, Component, Input, Output, SimpleChanges, OnChanges, EventEmitter, HostListener } from '@angular/core';
import { Observable, interval } from 'rxjs';
import * as Selection from 'd3-selection';
import * as Shape from 'd3-shape';
import * as Random from 'd3-random';
import * as Drag from 'd3-drag';

import { Graph } from './../models/graph.model';
import { Config } from './../models/config.model';
import { Point } from './../models/point.model';
import { NlsCanvasService } from './../services/canvas.service';
import { NlsHistoryService } from './../services/history.service';
import { NlsMathService } from './../services/math.service';
import { NlsGuillocheDirective } from './../directives/guilloche.directive';
import { NlsGraphService } from './../services/graph.service';

const RESIZING_TIMEOUT = 800;

@Component({
  selector: 'nls-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class NlsGraphsComponent implements OnChanges {

  public canvas: any | null;
  public matrix: any | null;
  public graphs: Graph[];
  public windowHeight: number | null;
  public windowWidth: number | null;

  private genShiftPoint: any | null;
  private genLoadedAllGraphs: any | null;
  private hash: string;
  private resizingWindow: any;

  @Input() config: Config;
  @Input() restoredHistory: any;
  @Input() animation: boolean;
  @Output() svgChange = new EventEmitter();
  @Output() graphChange = new EventEmitter();
  @ViewChild('svg') svgElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    clearTimeout(this.resizingWindow);

    this.resizingWindow = setTimeout(() => {
      this.canvas = this.adjustCanvas();
      this.matrix = this.calcMatrix();
      this.updateGraphs();
    }, RESIZING_TIMEOUT);
  }

  constructor(
    private canvasService: NlsCanvasService,
    private historyService: NlsHistoryService,
    private math: NlsMathService,
    private graphService: NlsGraphService
  ) {
    this.genLoadedAllGraphs = this.countLoadedGraphs();
    this.resizingWindow = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.canvas = this.adjustCanvas();
    this.matrix = this.calcMatrix();

    if (changes.config) {
      this.updateGraphs();
    }

    if (this.restoredHistory && this.restoredHistory.hash !== this.hash) {
      this.restoreGraph();
    }
  }

  private restoreGraph() {
    this.graphs = this.restoredHistory.graphs;
    this.hash = this.restoredHistory.hash;
  }

  private saveHistory() {
    this.hash = this.historyService.hash(this.graphs);
    this.historyService.save(this.graphs, this.config);
  }

  private saveGraph() {
    this.graphService.set(this.graphs);
  }

  private updateGraphs(): void {
    const genShiftStart = this.shiftPoint(this.matrix.start, this.config.vectors.start);
    const genShiftEnd = this.shiftPoint(this.matrix.end, this.config.vectors.end, false);

    const curveList = [
      {
        color: this.config.colors.primary,
        start: genShiftStart.next().value,
        end: genShiftEnd.next().value
      },
      {
        color: this.config.colors.secondary,
        start: genShiftEnd.next().value,
        end: genShiftStart.next().value
      }
    ];

    this.graphs = curveList.map(curve => {
      return {
        ...this.adjustGraph(curve),
        spread: this.config.spread,
        interval: this.config.interval
      };
    });
    this.hash = this.historyService.hash(this.graphs);
    this.saveHistory();
    this.saveGraph();
  }

  private adjustGraph(curve) {
    return Object.assign(curve, {
      stroke: this.config.stroke,
      start: Object.assign(curve.start, {
        direction: this.genVectorPoint(curve.start.point, curve.start.vector)
      }),
      end: Object.assign(curve.end, {
        direction: this.genVectorPoint(curve.end.point, curve.end.vector)
      }),
      nodes: this.genRandomPoints(this.config.nodes)
    });
  }

  private genRandomPoints(num: number) {
    const generatedPoints = [];

    for (let i = 0; i < this.config.nodes; i++) {
      generatedPoints.push(this.math.randomPoint(this.matrix, this.config.overlap));
    }

    return generatedPoints;
  }

  private flipflop(x: string) {
    return (x === 'start') ? 'end' : 'start';
  }

  private adjustCanvas(): void {
    this.canvasService.set(this.canvas);
    this.canvasService.adjustToWindow();

    return this.svgElementRef.nativeElement;
  }

  private calcMatrix() {
    const canvasWidth = this.canvas.getBoundingClientRect().width;
    const canvasHeight = this.canvas.getBoundingClientRect().height;
    const totalArea = Math.abs(canvasWidth * canvasHeight);
    const totalCenter = this.math.centerOfArea(canvasWidth, canvasHeight);
    const baseArea = Math.abs(this.config.width * this.config.height);
    const baseScale = Math.pow(totalArea / baseArea * this.config.scale, 0.5);
    const baseWidthScaled = baseScale * this.config.width;
    const baseHeightScaled = baseScale * this.config.height;
    const baseCenter = this.math.centerOfArea(
      baseWidthScaled,
      baseHeightScaled
    );

    if (this.config.autoHeight) {
      // Snap bottom and top to window limits
      return {
        start: {
          x: totalCenter.x - baseCenter.x,
          y: canvasHeight
        },
        end: {
          x: totalCenter.x + baseCenter.x,
          y: 0
        },
        width: canvasWidth,
        height: canvasHeight,
        center: totalCenter
      };
    } else {
      // Adjust matrix relatively to window size
      return {
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
  }

  private genVectorPoint(point: Point, vector: number) {
    const range = this.math.Δ(this.matrix.start, this.matrix.end) * this.config.vectors.range;

    return {
      x: range * Math.sin(Math.PI * vector) + point.x,
      y: range * Math.cos(Math.PI * vector) + point.y
    };
  }

  private *shiftPoint(point: Point, vector: number, startPositive: boolean = true) {
    const genShiftX = this.shiftNumber(this.config.vectors.spacing, vector, startPositive);
    const genShiftY = this.shiftNumber(this.config.vectors.spacing, vector, startPositive);

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

  private *shiftNumber(space: number, vector: number, startPositive: boolean = true) {
    let current = 0;
    let index = 0;
    const sign = this.math.flipSign(startPositive);

    while (true) {
      yield current = sign.next().value * index * space + current;
      index++;
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
