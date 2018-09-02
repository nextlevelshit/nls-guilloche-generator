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

import { ViewChild, Component, Input, Output, SimpleChanges, OnChanges, EventEmitter, OnInit, HostListener } from '@angular/core';
import { Observable, interval, Subscription } from 'rxjs';
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

@Component({
  selector: 'nls-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class NlsGraphsComponent implements OnChanges, OnInit {

  public canvas: any | null;
  public matrix: any | null;
  public graphs: Graph[];
  public windowHeight: number | null;
  public windowWidth: number | null;

  private genShiftPoint: any | null;
  private genLoadedAllGraphs: any | null;
  private hash: string;

  @Input() config: Config;
  @Input() restoredHistory: any;
  @Input() animation: boolean;
  @Output() svgChange = new EventEmitter();
  @Output() graphChange = new EventEmitter();
  @ViewChild('svg') svgElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.canvasService.adjustToWindow();
  }

  constructor(
    private canvasService: NlsCanvasService,
    private historyService: NlsHistoryService,
    private math: NlsMathService,
    private graphService: NlsGraphService
  ) {
    this.genLoadedAllGraphs = this.countLoadedGraphs();
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateCanvas();
    this.updateMatrix();

    console.log(changes);

    if (changes.config) {
      // Config changes must not trigger any other events
      this.updateGraphs();
      return;
    }

    if (this.restoredHistory && this.restoredHistory.hash !== this.hash) {
      this.graphs = this.restoredHistory.graphs;
      this.hash = this.restoredHistory.hash;
    }
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
        spread: this.config.spread
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

  private updateCanvas(): void {
    this.canvas = this.svgElementRef.nativeElement;
    this.canvasService.set(this.canvas);
    this.canvasService.adjustToWindow();
  }

  private updateMatrix() {
    const totalArea = Math.abs(this.canvas.getBoundingClientRect().width * this.canvas.getBoundingClientRect().height);
    const totalCenter = this.math.centerOfArea(this.canvas.getBoundingClientRect().width, this.canvas.getBoundingClientRect().height);

    const baseArea = Math.abs(this.config.width * this.config.height);
    const baseScale = Math.pow(totalArea / baseArea * this.config.scale, 0.5);
    const baseWidthScaled = baseScale * this.config.width;
    const baseHeightScaled = baseScale * this.config.height;
    const baseCenter = this.math.centerOfArea(baseWidthScaled, baseHeightScaled);

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
