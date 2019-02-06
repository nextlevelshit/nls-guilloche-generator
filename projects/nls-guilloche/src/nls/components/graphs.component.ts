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
import * as Random from 'd3-random';
import * as Timer from 'd3-timer';
import * as Array from 'd3-array';

import { Graph } from './../models/graph.model';
import { Config } from './../models/config.model';
import { ConfigForm } from './../../../../../src/app/forms/config.form';
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
  private genShiftPoint: any | null;
  private genAllGraphsLoaded: any | null;
  private resizingWindow: any;

  public canvas: any | null;
  public matrix: any | null;
  public graphs: Graph[];
  public windowHeight: number | null;
  public windowWidth: number | null;

  @Input() config: Config;
  @Input() restoredHistory: any;
  @Output() svgChange = new EventEmitter();
  @Output() graphChange = new EventEmitter();
  @ViewChild('svg') svgElementRef;

  // @HostListener('window:resize', ['$event'])
  // onResize(event) {
  //   clearTimeout(this.resizingWindow);

  //   this.resizingWindow = setTimeout(() => {
  //     this.adjustCanvas();
  //     this.calcMatrix();
  //     this.updateGraphs();
  //   }, RESIZING_TIMEOUT);
  // }

  constructor(
    private canvasService: NlsCanvasService,
    private historyService: NlsHistoryService,
    private math: NlsMathService,
    private graphService: NlsGraphService
  ) {
    this.genAllGraphsLoaded = this.allGraphsLoaded();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.adjustCanvas();
    this.calcMatrix();

    if ('restoredHistory' in changes
      && !changes.restoredHistory.firstChange
    ) {
      this.restoreGraphs();
    } else if ('config' in changes) {
      this.createGraphs();
      // if (this.graphs && this.config.animation.enabled) {
      //   this.updateGraphs();
      // } else {
      //   if (changes.config.firstChange) {
      //     this.createGraphs();
      //   } else {
      //     const currentConfig = changes.config.currentValue.animation;
      //     const previousConfig = changes.config.previousValue.animation;

      //     if (
      //       previousConfig.interval === currentConfig.interval
      //       && previousConfig.enabled === currentConfig.enabled
      //       && previousConfig.shift === currentConfig.shift
      //     ) {
      //       this.createGraphs();
      //     }
      //   }
      // }
      this.saveGraphs();
    }
  }

  private get graphsPreparedForExport(): boolean {
    return this.genAllGraphsLoaded.next().value;
  }

  private restoreGraphs() {
    this.graphs = this.restoredHistory.graphs;
    this.config = this.restoredHistory.config;
  }

  private saveGraphs() {
    this.graphService.set(this.graphs);
    this.historyService.save(this.graphs, this.config);
  }

  private createGraphs(): void {
    const genShiftStart = this.shiftPoint(
      this.matrix.start,
      this.config.vectors.start
    );
    const genShiftEnd = this.shiftPoint(
      this.matrix.end,
      this.config.vectors.end
    );

    this.graphs = [
      {
        color: this.config.colors.primary,
        start: genShiftStart.next().value,
        end: genShiftEnd.next().value
      },
      {
        color: this.config.colors.secondary,
        start: genShiftEnd.next().value,
        end: genShiftStart.next().value
      },
    ].map((graph, i) => {
      return {
        ...this.adjustGraph(graph),
        id: this.historyService.hash(graph),
        spread: this.config.spread,
        debug: this.config.debug,
        animation: {
          shift: this.animationShift,
          // interval: this.animationInterval,
          enabled: this.config.animation.enabled,
          radius: this.config.animation.radius,
          frequency: this.config.animation.frequency,
          ticksTotal: this.config.animation.ticksTotal,
          amplitude: this.config.animation.amplitude
        }
      };
    });
  }

  // private get animationInterval(): number {
  //   const random = Random.randomLogNormal(0, 0.2)();
  //   return this.config.animation.interval * random;
  // }

  private get animationShift(): number {
    return this.config.animation.shift * this.matrix.unit;
  }

  // private updateGraphs(): void {
  //   this.graphs = this.graphs.map(graph => {
  //     return {
  //       ...graph,
  //       nodes: this.refreshRandomPoints(graph),
  //       animation: {
  //         ...this.config.animation,
  //         interval: this.animationInterval,
  //         shift: this.animationShift
  //       }
  //     };
  //   });
  // }

  // private refreshRandomPoints(graph: Graph): Point[] {
  //   const nextNodes = graph.nodes.map(node => {
  //     return this.math.randomPoint(
  //       this.matrix,
  //       this.config.overlap,
  //       node,
  //       graph.animation.shift
  //     );
  //   });

  //   return this.calculateNodesradians({
  //     ...graph,
  //     nodes: nextNodes
  //   });
  // }

  private adjustGraph(graph: Graph): Graph {
    graph = {
      ...graph,
      start: {
        ...graph.start,
        direction: this.genVectorPoint(
          graph.start.point,
          graph.start.vector
        )
      },
      end: {
        ...graph.end,
        direction: this.genVectorPoint(
          graph.end.point,
          graph.end.vector
        )
      }
    };

    // const center = this.math.centerOfPoints(
    //   graph.start.direction,
    //   graph.end.direction
    // );

    graph.nodes = this.generateRandomPoints();
    graph.nodes = this.calculateNodesradians(graph);

    graph.nodes = graph.nodes.slice().sort((a: Point, b: Point) => {
      return this.math.Δ(b, graph.start.direction) - this.math.Δ(a, graph.start.direction);
    }).reduceRight((acc, val, i) => {
      return i % 2 === 0 ? [...acc, val] : [val, ...acc];
    }, []);

    return graph;
  }

  private generateRandomPoints(): Point[] {
    const generatedPoints: Point[] = [];

    return Array.range(this.config.nodes).map((d, i) => {
      return this.math.randomPoint(
        this.matrix,
        this.config.overlap
      );
    });
  }

  private calculateNodesradians(graph: Graph): Point[] {
    return graph.nodes.map((point, i, allNodes) => {
      let prev = allNodes[i - 1];
      let next = allNodes[i + 1];

      if (i === 0) {
        prev = graph.start.direction;
      }
      if (i === allNodes.length - 1) {
        next = graph.end.direction;
      }
      return {
        ...point,
        radians: this.math.angleRadians(prev, next)
      };
    });
  }

  private adjustCanvas(): void {
    this.canvasService.set(this.canvas);
    this.canvas = this.svgElementRef.nativeElement;
  }

  private calcMatrix(): void {
    const canvasWidth = this.canvas.getBoundingClientRect().width;
    const canvasHeight = this.canvas.getBoundingClientRect().height;
    // const totalArea = Math.abs(canvasWidth * canvasHeight);
    const totalCenter = this.math.centerOfArea(canvasWidth, canvasHeight);
    const marginY = this.config.margin.y * canvasHeight;
    const marginX = this.config.margin.x * canvasWidth;
    const lineSpacing = this.config.vectors.spacing;
    const vectorStart = this.config.vectors.start;
    const vectorEnd = this.config.vectors.end;

    this.matrix = {
      start: {
        x: (marginX + lineSpacing) * Math.abs(Math.cos(vectorStart * Math.PI)),
        y: canvasHeight - (marginY + lineSpacing) * Math.abs(Math.sin(vectorStart * Math.PI))
      },
      end: {
        x: canvasWidth - (marginX + lineSpacing) * Math.abs(Math.cos(vectorEnd * Math.PI)),
        y: (marginY + lineSpacing) * Math.abs(Math.sin(vectorEnd * Math.PI))
      },
      width: canvasWidth,
      height: canvasHeight,
      center: totalCenter,
      unit: Math.max(
        canvasHeight / canvasWidth,
        canvasWidth / canvasHeight
      )
    };
  }

  private genVectorPoint(
    point: Point,
    vector: number
  ): Point {
    const tension = this.math.Δ(this.matrix.start, this.matrix.end) * this.config.vectors.tension;

    return {
      x: tension * Math.sin(Math.PI * vector) + point.x,
      y: tension * Math.cos(Math.PI * vector) + point.y
    };
  }

  private *shiftPoint(point: Point, vector: number, startPositive: boolean = true) {
    const genShiftX = this.shiftNumber(this.config.vectors.spacing, vector, startPositive);
    const genShiftY = this.shiftNumber(this.config.vectors.spacing, vector, startPositive);

    while (true) {
      yield {
        point: {
          x:
            Math.cos(Math.PI * vector)
            * genShiftX.next().value
            + point.x,
          y:
            Math.sin(Math.PI * vector)
            * genShiftY.next().value
            + point.y,
        },
        vector: vector
      };
    }
  }

  public finishedRefresh(graphId: string): void {
    // if (this.config.animation.enabled) {
    //   const i = this.graphService.getIndexById(graphId);
    //    if (i >= 0) {
    //      const graph = this.graphs[i];

    //      this.graphs[i] = {
    //        ...graph,
    //        nodes: this.refreshRandomPoints(graph)
    //      };
    //    }
    // }

    if (this.graphsPreparedForExport) {
      this.svgChange.emit(this.svgElementRef);
    }
  }

  private *shiftNumber(
    space: number,
    vector: number,
    startPositive: boolean = true
  ) {
    let current = 0;
    let index = 0;
    const sign = this.math.flipSign(startPositive);

    while (true) {
      yield current = sign.next().value * index * space + current;
      index++;
    }
  }
  private *allGraphsLoaded() {
    let cycles = 1;

    while (true) {
      if (cycles % this.graphs.length === 0) {
        yield true;
      } else {
        yield false;
      }
      cycles++;
    }
  }
}
