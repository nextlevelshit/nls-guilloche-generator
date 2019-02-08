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
import * as Shape from 'd3-shape';
import * as Selection from 'd3-selection';
import tooloud from 'tooloud';

import { Matrix } from './../models/matrix.model';
import { Graph } from './../models/graph.model';
import { Config } from './../models/config.model';
import { Point } from './../models/point.model';
import { NlsCanvasService } from './../services/canvas.service';
import { NlsHistoryService } from './../services/history.service';
import { NlsMathService } from './../services/math.service';
import { NlsGuillocheDirective } from './../directives/guilloche.directive';
import { NlsGraphService } from './../services/graph.service';

const RESIZING_TIMEOUT = 800;
const { Simplex } = tooloud;

@Component({
  selector: 'nls-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class NlsGraphsComponent implements OnChanges {
  private genShiftPoint: any | null;
  private genAllGraphsLoaded: any | null;
  private resizingWindow: any;
  private transition: any;

  public canvas: any | null;
  public matrix: Matrix;
  public graphs: Graph[];
  public windowHeight: number | null;
  public windowWidth: number | null;
  public renderedGraphs: Graph[];

  @Input() config: Config;
  @Input() restoredHistory: any;
  @Output() svgChange = new EventEmitter();
  // @Output() graphChange = new EventEmitter();
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

      if (this.config.animation.enabled) {
        // If transition is enabled, first check if
        // any graphs already existing, otherwise
        // start transition immediatly.
        if (!this.graphs) {
          this.createGraphs();
        }
        this.transition = Timer.timer(t => {
          this.updateGraphs();
        }, 120);
      } else {
        // If transition is running, just stop it,
        // otherwise create complete new graphs.
        if (this.transition) {
          this.transition.stop();
          this.transition = null;
        } else {
          this.createGraphs();
        }
      }
      this.saveGraphs();
    }
  }

  private get graphsPreparedForExport(): boolean {
    return this.genAllGraphsLoaded.next().value;
  }

  private restoreGraphs() {
    this.graphs = this.restoredHistory.graphs;
    this.config = this.restoredHistory.config;
    this.renderedGraphs = this.graphs.map(graph => {
      return {
        start: graph.start,
        end: graph.end,
        spread: graph.spread,
        color: graph.color,
        stroke: graph.stroke,
        nodes: graph.nodes,
        animation: graph.animation
      };
    });
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
          enabled: false
        }
      };
    });

    this.renderedGraphs = this.graphs.map(graph => {
      return {
        start: graph.start,
        end: graph.end,
        spread: graph.spread,
        color: graph.color,
        stroke: graph.stroke,
        nodes: graph.nodes,
        animation: graph.animation
      };
    });
  }

  private adjustNoise(): any {
    return Array.range(this.config.nodes).map(() => {
      return Simplex.create(Math.floor(Math.random() * 10000));
    });
  }

  private adjustNodes(): Point[] {
    return this.generateRandomPoints();
  }

  private adjustSamplesList(simplexNoise: any, nodes: Point[]): Point[] {
    return simplexNoise.map((simplex, i) => {
      const start = nodes[i];
      const unit = Math.min(this.matrix.width, this.matrix.height);
      const scale = unit * (this.config.animation.radius + this.config.animation.radius * Random.randomNormal(0, 0.1)());
      const frequency = this.config.animation.frequency + this.config.animation.frequency * Random.randomNormal(0, 0.1)();

      return Array.range(frequency).map((sample, j) => {
        const radians = j / frequency * Math.PI * 2;
        const x = start.x + Math.sin(radians) * scale;
        const y = start.y + Math.cos(radians) * scale;
        const noisedScale = (simplex.noise(x, y, 0) * this.config.animation.amplitude * scale + scale);

        return {
          x: Math.sin(radians) * noisedScale + start.x,
          y: Math.cos(radians) * noisedScale + start.y
        };
      });
    });
  }

  private adjustNoisePathList(samplesList: Point[], group: any): any {
    return samplesList.map(samples => {
      return group
        .append('path')
        .attr('d', Shape.line()
          .x(p => p.x)
          .y(p => p.y)
          .curve(Shape.curveBasisClosed)(samples)
        );
    });
  }

  private adjustNodesGeneratorList(noisePathList: any): any {
    return noisePathList.map(noisePath => {
      return this.graphService.pointsOnPath(noisePath.node(), this.config.animation.ticksTotal);
    });
  }

  private get animationShift(): number {
    return this.config.animation.shift * this.matrix.unit;
  }

  private updateGraphs(): void {
    this.renderedGraphs = this.graphs.map(graph => {
      graph = {
        start : graph.start,
        end : graph.end,
        spread: graph.spread,
        color: graph.color,
        stroke: graph.stroke,
        nodes: graph.nodesGenerators.map((generator) => {
          return generator.next().value;
        }),
        animation: {
          enabled: true
        }
      };

      return this.appendNodesradians(graph);
    });
  }

  private adjustGraph(graph: Graph): Graph {
    const randomNodes = this.generateRandomPoints();
    const simplexNoise = this.adjustNoise();
    const samplesList = this.adjustSamplesList(simplexNoise, randomNodes);
    const shadowGroup = this.createShadowGroup();
    const noisePathList = this.adjustNoisePathList(samplesList, shadowGroup);
    const nodesGeneratorList = this.adjustNodesGeneratorList(noisePathList)
      .sort((a: Iterator<Point>, b: Iterator<Point>) => {
        const deltaAtoCenter = this.math.Δ(a.next().value, this.matrix.center);
        const deltaBtoCenter = this.math.Δ(b.next().value, this.matrix.center);

        return a.next().value.distanceToCenter - b.next().value.distanceToCenter;
      }).reduceRight((acc, val, i) => {
        return i % 2 === 0 ? [...acc, val] : [val, ...acc];
      }, []);

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
      },
      nodesGenerators: nodesGeneratorList,
      nodes: nodesGeneratorList.map((generator: Iterator<Point>) => {
        return generator.next().value;
      }),
    };

    return this.appendNodesradians(graph);
  }

  private createShadowGroup(): any {
    return Selection
      .select(this.canvas)
      .append('g')
      .attr('fill', 'none')
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .attr('stroke-width', 1)
      .attr('stroke', '#000');
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

  private appendNodesradians(graph: Graph): Graph {
    return {
      ...graph,
      nodes: graph.nodes.map((point: Point, i, allNodes) => {
        let prev = allNodes[i - 1];
        let next = allNodes[i + 1];

        if (i === 0) {
          prev = graph.start.direction;
        }
        if (i === allNodes.length - 1) {
          next = graph.end.direction;
        }

        return {
          x: point.x,
          y: point.y,
          radians: this.math.angleRadians(prev, next)
        };
      })
    };
  }

  private adjustCanvas(): void {
    this.canvas = this.svgElementRef.nativeElement;
    this.canvasService.set(this.canvas);
  }

  private calcMatrix(): void {
    const canvasWidth = this.canvas.getBoundingClientRect().width;
    const canvasHeight = this.canvas.getBoundingClientRect().height;
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
