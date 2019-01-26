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
  private genShiftPoint: any | null;
  private genAllGraphsLoaded: any | null;
  private hash: string;
  private resizingWindow: any;

  public canvas: any | null;
  public matrix: any | null;
  public graphs: Graph[];
  public windowHeight: number | null;
  public windowWidth: number | null;


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
      this.adjustCanvas();
      this.calcMatrix();
      this.updateGraphs();
    }, RESIZING_TIMEOUT);
  }

  constructor(
    private canvasService: NlsCanvasService,
    private historyService: NlsHistoryService,
    private math: NlsMathService,
    private graphService: NlsGraphService
  ) {
    this.genAllGraphsLoaded = this.allGraphsLoaded();
    this.resizingWindow = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.adjustCanvas();
    this.calcMatrix();

    // TODO

    if ('config' in changes) {
      this.updateGraphs();
    }

    if (this.restoredHistory && this.restoredHistory.hash !== this.hash) {
      this.restoreGraph();
    }
  }

  private get graphsPreparedForExport(): boolean {
    return this.genAllGraphsLoaded.next().value;
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
    const genShiftStart = this.shiftPoint(
      this.matrix.start,
      this.config.vectors.start
    );
    const genShiftEnd = this.shiftPoint(
      this.matrix.end,
      this.config.vectors.end
    );

    const graphList: Graph[] = [
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

    this.graphs = graphList.map(graph => {
      return {
        ...this.adjustGraph(graph),
        spread: this.config.spread,
        debug: this.config.debug,
        animation: {
          ...this.config.animation,
          interval: this.config.animation.interval * this.math.randomFloat(0.8, 1.2)
        }
      };
    });

    this.hash = this.historyService.hash(this.graphs);
    this.saveHistory();
    this.saveGraph();
  }

  private adjustGraph(graph: Graph): Graph {
    const startDirection = this.genVectorPoint(graph.start.point, graph.start.vector);
    const endDirection = this.genVectorPoint(graph.end.point, graph.end.vector);

    return {
      ...graph,
      start: {
        ...graph.start,
        direction: startDirection
      },
      end: {
        ...graph.end,
        direction: endDirection
      },
      // nodes: this.genRandomPoints(this.config.nodes)
      nodes: this.genRandomPoints(this.config.nodes).sort((a: Point, b: Point) => {
        const orientation = startDirection;
        return this.math.Δ(a, orientation) - this.math.Δ(b, orientation);
        // return this.math.Δ(b, orientation) - this.math.Δ(a, orientation);
        // return (orientation.x - b.x) - (orientation.x - a.x);
        // return (orientation.y - b.y) - (orientation.y - a.y);
      })
    };
  }

  /**
   * BERLIN, 12.01.2019
   *
   * Manchmal kostet es einen doch ein größeres Stück Arbeit als sonst, seine
   * Tage zu „nutzen“. Was schadet einem schon ein verlorener Tag? Sollte man
   * diese nicht lieber anerkennen und besonders behutsam sein? Wenn ich an
   * solchen Tagen einfach weniger zulasse und selber Entscheidungen übernehme,
   * kann ich niemanden anderen dafür zur Verantwortung ziehen. Auf diese
   * Weise bleibe ich selbstwirksam und werde gezwungen mir Raum und Zeit für
   * mich einzufordern. Nicht nur von mir, sondern auch von meinem Umfeld.
   * Ich bin alleinig in der Verantwortung meinen Schwermut zu äußern ohne
   * gleichzeitig einzufordern, dass mein Gegenüber Bescheid weiß wie er auf
   * mich zu reagieren hat. Paradoxerweise wünsche ich mir in solchen
   * Situationen, dass ich von einer empathischen und loyalen Wärme umarmt
   * werde, in der mir einfach Verständnis entgegengebracht wird, quasi am
   * kleinen Finger geführte werde.
   *
   * In Zeiten der Rumtriebigkeit^[Typische Anzeichen für *Rumtriebigkeit*:
   * - Viele Dinge anfangen und nicht zu Ende bringen
   * -
   * ] und zu großen Komforts^[Typische Anzeichen:
   * - Fehlende kreative Betätigung
   * - Fehlende körperliche Betätigung
   * - Fehlende Muße zu Ordnung
   * - Lethargie
   * - Häufige Schlemmereien (Nachos, Eis, Süßes im Allgemeinen etc.)
   * ]
   * Der einfachste Ausweg aus der Lethargie wäre es schon einmal die un-
   * gewünschten Aufgaben sich so angenehm wie möglich zu gestalten. Ich
   * bspw. kiffe einfach gerne einen dabei und lasse mal meine grauen
   * Zellen für mich arbeiten. Ich bekomme ein angenehmes Körpergefühl
   * und verspüre überhaupt keinen Druck mehr Großartiges leisten zu müssen.
   */

  private genRandomPoints(num: number): Point[] {
    const generatedPoints: Point[] = [];

    for (let i = 1; i <= this.config.nodes; i++) {
      generatedPoints.push(
        this.math.randomPoint(
          this.matrix,
          this.config.overlap
        )
      );
    }

    return generatedPoints;
  }

  private adjustCanvas(): void {
    this.canvasService.set(this.canvas);
    this.canvas = this.svgElementRef.nativeElement;
  }

  private calcMatrix(): void {
    const canvasWidth = this.canvas.getBoundingClientRect().width;
    const canvasHeight = this.canvas.getBoundingClientRect().height;
    const totalArea = Math.abs(canvasWidth * canvasHeight);
    const totalCenter = this.math.centerOfArea(canvasWidth, canvasHeight);
    const marginY = this.config.margin.y * canvasHeight;
    const marginX = this.config.margin.x * canvasWidth;
    const lineSpacing = this.config.vectors.spacing;
    const vectorStart = this.config.vectors.start;
    const vectorEnd = this.config.vectors.end;

    this.matrix = {
      start: {
        x: Math.round(1000 * ((marginX + lineSpacing) * Math.abs(Math.cos(vectorStart * Math.PI)))) / 1000,
        // y: canvasHeight - this.config.vectors.spacing
        y: Math.round(1000 * ((canvasHeight - (marginY + lineSpacing) * Math.abs(Math.sin(vectorStart * Math.PI))))) / 1000
      },
      end: {
        x: Math.round(1000 * ((canvasWidth - (marginX + lineSpacing) * Math.abs(Math.cos(vectorEnd * Math.PI))))) / 1000,
        // x: canvasWidth - this.config.vectors.spacing,
        y: Math.round(1000 * ((marginY + lineSpacing) * Math.abs(Math.sin(vectorEnd * Math.PI)))) / 1000
      },
      width: canvasWidth,
      height: canvasHeight,
      center: totalCenter
    };
  }

  private genVectorPoint(
    point: Point,
    vector: number
  ): Point {
    const tension = this.math.Δ(this.matrix.start, this.matrix.end) * this.config.vectors.tension;

    return {
      x: Math.round(1000 * (tension * Math.sin(Math.PI * vector) + point.x)) / 1000,
      y: Math.round(1000 * (tension * Math.cos(Math.PI * vector) + point.y)) / 1000
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

  public prepareExport(): void {
    if (this.graphsPreparedForExport) {
      this.svgChange.emit(this.svgElementRef);
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
