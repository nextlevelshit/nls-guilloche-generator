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

    setTimeout(this.prepareGuillocheExport(), 1000);
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
        interval: this.config.interval
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
      nodes: this.genRandomPoints(this.config.nodes).sort((a: Point, b: Point) => {
        const start = graph.start.point;
        // return this.math.Δ(a, startDirection) - this.math.Δ(b, startDirection);
        return this.math.Δ(a, start) - this.math.Δ(b, start);
        // return (graph.start.point.y - b.y) - (graph.start.point.y - a.y);
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
    this.canvasService.adjustToWindow();

    return this.svgElementRef.nativeElement;
  }

  private calcMatrix() {
    const canvasWidth = this.canvas.getBoundingClientRect().width;
    const canvasHeight = this.canvas.getBoundingClientRect().height;
    const totalArea = Math.abs(canvasWidth * canvasHeight);
    const totalCenter = this.math.centerOfArea(canvasWidth, canvasHeight);

    return {
      start: {
        x: this.config.margin.x,
        // y: canvasHeight - this.config.vectors.spacing
        y: canvasHeight - this.config.vectors.spacing - this.config.margin.y
      },
      end: {
        x: canvasWidth - this.config.vectors.spacing - this.config.margin.x,
        // x: canvasWidth - this.config.vectors.spacing,
        y: this.config.margin.y
      },
      width: canvasWidth,
      height: canvasHeight,
      center: totalCenter
    };
  }

  private genVectorPoint(point: Point, vector: number): Point {
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

  public prepareGuillocheExport(): void {
    this.svgChange.emit(this.svgElementRef);
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
