import { ElementRef, HostListener, Output, EventEmitter, OnInit, Input, OnChanges, SimpleChanges, Directive } from '@angular/core';
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
export class CanvasDirective implements OnInit, OnChanges {
  private canvas: any;
  private defs: any;
  private gradient: any;
  private svg: any;
  private expandedPoints: Point[];
  private drag: Point;
  private dragging: any;
  public config: Config;

  @Input()
  private param: Param;

  @Output()
  private emitConfig: EventEmitter<Config>;

  @HostListener('window:resize', ['$event'])
  private onResize(event) {
    // this.init();
  }

  constructor(
    private el: ElementRef
  ) {
    this.canvas = el.nativeElement;
    this.emitConfig = new EventEmitter();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes.param);
  }

  ngOnInit() {
    this.init();
  }

  private init() {
    this.updateConfig();
    this.initSvg();
    this.render();
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
    this.drawLine(this.getExpandedPoints);
    if (this.param.showGrid) {
      this.renderGrid(this.getExpandedPoints);
    }
  }

  private resetPoints(): void {
    Selection.selectAll('circle').remove();
  }

  private drawPoints(points: Point[]) {
    const that = this;
    const group = this.svg.append('g').attr('class', 'points');

    points.forEach(point => {
      group.append('circle')
        .attr('r', point.color ? 20 : 10)
        .attr('cx', point.x)
        .attr('cy', point.y)
        .attr('fill', point.color ? point.color : 'lightgray')
        .attr('stroke-width', !point.color ? 2 : 0)
        .attr('stroke', !point.color ? 'gray' : '')
        .style('cursor', 'pointer')
        .call(Drag.drag()
          .on('drag', function() {
            Selection.select(this)
              .attr('cx', Selection.event.x)
              .attr('cy', Selection.event.y);
          })
          .on('end', () => {
            this.drawLine(this.getExpandedPoints);
          }));
    });
  }

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

  private resetLines(): void {
    Selection.selectAll('path').remove();
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
    const group = Selection.select('g.points');
    const points = [];
    const that = this;

    let point = null;

    if (!group.size()) {
      return this.expandPoints([
        this.config.start,
        this.config.end
      ]);
    }

    group.selectAll('circle').each(function() {
      point = Selection.select(this);
      points.push({
        x: point.attr('cx'),
        y: point.attr('cy'),
        color: (that.param.colors.start === point.attr('fill') || that.param.colors.end === point.attr('fill')) ? point.attr('fill') : '',
      });
    });

    return points;
  }

  private Δ(a: Point, b: Point) {
    return Math.pow(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2), 0.5);
  }

  private generateRandomPoint(matrix) {
    return {
      x: Random.randomUniform(matrix.min.x, matrix.max.x)(),
      y: Random.randomUniform(matrix.min.y, matrix.max.y)()
    };
  }

  private renderGrid(points: Point[]) {
    const startingPoints = [points.shift(), points.pop()];
    // const startingPoints = [...points];
    let group: any;

    if (!Selection.select('g.grid').size()) {
      group = this.svg.append('g').attr('class', 'grid');
    } else {
      group = Selection.select('g.grid');
    }

    points.forEach(p => {
      startingPoints.forEach(s => {
        group.append('circle')
        .attr('cx', s.x)
        .attr('cy', s.y)
        .attr('r', this.Δ(p, s))
        .attr('stroke-width', 1)
        .attr('fill-opacity', 0)
        .attr('stroke', 'gainsboro');
      });
    });

    group.lower();
  }

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
      },
      drag: this.drag
    };
    // Emit Canvas Config to parent Component
    this.emitConfig.next(this.config);
  }
}
