import { ElementRef, HostListener, Output, EventEmitter,  Input, Directive, SimpleChanges, OnChanges } from '@angular/core';
import * as Selection from 'd3-selection';
import * as Shape from 'd3-shape';
import * as Random from 'd3-random';
import * as Drag from 'd3-drag';

import { Config } from './../models/config.model';
import { Point } from './../models/point.model';
import { Param } from './../models/param.model';

@Directive({
  selector: '[appCanvas]'
})
export class CanvasDirective implements OnChanges {
  private canvas: any;
  private defs: any;
  private gradient: any;
  private svg: any;
  private expandedPoints: Point[];
  private param: Param;
  public config: Config;

  @Input() private paramStartingColor: string;
  @Input() private paramEndingColor: string;
  @Input() private paramMarginX: number;
  @Input() private paramMarginY: number;
  @Input() private paramPoints: number;
  @Input() private paramSpread: number;
  @Input() private paramStrokeWidth?: number;
  @Input() private paramShowGrid?: boolean;

  @Output() private emitConfig: EventEmitter<Config>;

  @HostListener('window:resize', ['$event'])
  private onResize(event) {
    this.init();
  }

  constructor(
    private el: ElementRef
  ) {
    this.canvas = el.nativeElement;
    this.emitConfig = new EventEmitter();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.init();
  }

  private init() {
    this.resetLines();
    this.resetPoints();
    this.updateParamObject();
    this.updateConfig();
    this.initSvg();
    this.render();
  }

  private updateParamObject() {
    this.param = {
      colors: {
        start: this.paramStartingColor,
        end: this.paramEndingColor
      },
      points: this.paramPoints,
      margin: {
        x: this.paramMarginX,
        y: this.paramMarginY,
      },
      spread: this.paramSpread,
      stroke: {
        width: this.paramStrokeWidth
      },
      showGrid: this.paramShowGrid
    };
  }

  private initSvg() {
    if (!this.svg) {
      this.svg = Selection.select(this.canvas).append('svg');
      this.defs = this.svg.append('defs');
        this.gradient = this.defs.append('linearGradient')
          .attr('id', 'gradient');
        this.gradient.append('stop')
          .attr('stop-color', this.param.colors.end)
          .attr('offset', '0%');
        this.gradient.append('stop')
          .attr('stop-color', this.param.colors.start)
          .attr('offset', '100%');
    }
    this.svg
      .attr('width', this.config.width)
      .attr('height', this.config.height);
  }

  private render() {
    this.drawPoints(this.getExpandedPoints);
    this.resetGrid();
    this.renderGrid(this.getExpandedPoints);
    this.spreadLines(this.getExpandedPoints);
  }

  private resetPoints(): void {
    Selection.selectAll('g#spread-points').remove();
    Selection.selectAll('g#points').remove();
  }

  private drawPoints(points: Point[]) {
    const that = this;
    const group = this.svg.append('g').attr('id', 'points');

    points.forEach(point => {
      const fill = !this.param.showGrid ? 'none' : point.color ? point.color : 'lightgray';

      group.append('circle')
        .attr('r', 10)
        .attr('cx', point.x)
        .attr('cy', point.y)
        .attr('fill', fill);
    });
  }

  private expandPoints(points: Point[]) {
    const newPoints: Point[] = [];

    const matrix = {
      min: {
        x: points.reduce((a, b) => a.x < b.x ? a : b).x,
        y: points.reduce((a, b) => a.y < b.y ? a : b).y,
      },
      max: {
        x: points.reduce((a, b) => a.x > b.x ? a : b).x,
        y: points.reduce((a, b) => a.y > b.y ? a : b).y,
      }
    };

    points.splice(1, 0, {
      x: this.config.end.x,
      y: this.config.height - this.config.height * this.param.margin.y
    });
    points.splice(1, 0, {
      x: this.config.start.x,
      y: this.config.height * this.param.margin.y
    });

    for (let i = 0; i < this.param.points; i++) {
      points.splice(2, 0, this.generateRandomPoint(matrix));
    }

    return points;
  }

  private get getExpandedPoints() {
    const group = Selection.select('g#points');
    const points = [];
    const that = this;

    if (!group.selectAll('circle').size()) {
      return this.expandPoints([
        this.config.start,
        this.config.end
      ]);
    }

    group.selectAll('circle').each(function() {
      const point = Selection.select(this);

      points.push({
        x: point.attr('cx'),
        y: point.attr('cy'),
        color: (that.param.colors.start === point.attr('fill') || that.param.colors.end === point.attr('fill')) ? point.attr('fill') : '',
      });
    });
    return points;
  }

  private generateRandomPoint(matrix) {
    return {
      x: Random.randomUniform(matrix.min.x, matrix.max.x)(),
      y: Random.randomUniform(matrix.min.y, matrix.max.y)()
    };
  }

  private spreadLines(points: Point[]) {
    const indexMiddle = Math.floor(points.length * 0.5);
    const pointMiddle = points[indexMiddle];
    const closestCenter = this.getFarestCenter(pointMiddle);
    const radius = this.Δ(pointMiddle, closestCenter);
    const spreadPoints = [];
    const group = this.svg.append('g').attr('id', 'spread-points');
    const pies = 80;

    for (let i = 0; i < pies; i++) {
      spreadPoints.push({
        x: radius * Math.cos(2 * i * Math.PI / pies) + closestCenter.x,
        y: radius * Math.sin(2 * i * Math.PI / pies) + closestCenter.y,
      });
    }

    spreadPoints.sort((a, b) => {
      return this.Δ(a, pointMiddle) - this.Δ(b, pointMiddle);
      // Good possibility to align orientation points outsite
      // return this.Δ(b, pointMiddle) - this.Δ(a, pointMiddle);
    });

    spreadPoints.some((point, index) => {
      if (this.param.showGrid) {
        group.append('circle')
          .attr('cx', point.x)
          .attr('cy', point.y)
          .attr('r', 4)
          .attr('fill', 'gray');
      }

      points[indexMiddle] = point;

      this.drawLine(points);

      return index === this.param.spread - 1;
    });

    group.lower();
  }

  private getClosestCenter(point: Point) {
    if (this.Δ(point, this.config.start) < this.Δ(point, this.config.end)) {
      return this.config.start;
    } else {
      return this.config.end;
    }
  }

  private getFarestCenter(point: Point) {
    if (this.Δ(point, this.config.start) > this.Δ(point, this.config.end)) {
      return this.config.start;
    } else {
      return this.config.end;
    }
  }

  /**
   * Draw a curve with a given set of orientation points.
   * @param points Point
   */
  private drawLine(points: Point[]) {
    return this.svg.append('path')
      .attr('d', Shape.line()
        .x(p => p.x)
        .y(p => p.y)
        .curve(Shape.curveBasis)(points))
      .attr('stroke', 'url(#gradient)')
      .attr('stroke-width', this.param.stroke ? this.param.stroke.width : 4)
      .attr('fill', 'none');
  }

  /**
   * Remove all lines from Canvas.
   */
  private resetLines(): void {
    Selection.selectAll('path').remove();
  }

  /**
   * Calculate distance between to points with coordinates.
   * @param a
   * @param b
   */
  private Δ(a: Point, b: Point) {
    return Math.pow(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2), 0.5);
  }

  /**
   * Render a grid with concentrical radius from starting points
   * to the center of each orientation point.
   * @param points
   */
  private renderGrid(points: Point[]) {
    if (!this.param.showGrid) {
      return;
    }

    const startingPoints = [points.shift(), points.pop()];
    const group = this.svg.append('g').attr('id', 'grid');

    points.forEach(p => {
      startingPoints.forEach(s => {
        group.append('circle')
        .attr('cx', s.x)
        .attr('cy', s.y)
        .attr('r', this.Δ(s, p))
        .attr('stroke-width', 1)
        .attr('fill-opacity', 0)
        .attr('stroke', 'gainsboro');
      });
    });
    // Pushing group layout to the bottom of the SVG.
    group.lower();
  }

  private resetGrid() {
    Selection.selectAll('g#grid').remove();
  }

  /**
   * Update Config Parameters and emit to parent component.
   */
  private updateConfig(): void {
    const margin = this.canvas.clientWidth * this.param.margin.x;

    this.config = {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight,
      start: {
        x: this.canvas.clientWidth - margin,
        y: 0,
        color: this.param.colors.start
      },
      end: {
        x: 0 + margin,
        y: this.canvas.clientHeight,
        color: this.param.colors.end
      }
    };
    // Emit Canvas Config to parent Component.
    this.emitConfig.next(this.config);
  }
}
