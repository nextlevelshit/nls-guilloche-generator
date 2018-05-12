import { Directive, ElementRef, Renderer, AfterViewInit, HostListener, Output, EventEmitter, OnInit } from '@angular/core';
import * as Selection from 'd3-selection';
import * as Shape from 'd3-shape';

import { Config } from './../models/config.model';
import { Point } from './../models/point.model';

@Directive({
  selector: '[appCanvas]'
})
export class CanvasDirective implements OnInit {
  private canvas: any;
  private svg: any;
  public config: Config;

  @Output() emitConfig: EventEmitter<Config>;
  @HostListener('window:resize', ['$event'])
  private onResize(event) {
    this.init();
  }

  constructor(
    private el: ElementRef,
    private renderer: Renderer
  ) {
    this.canvas = el.nativeElement;
    this.emitConfig = new EventEmitter();
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
    }
    this.svg
      .attr('width', this.config.width)
      .attr('height', this.config.height);
  }

  private render() {
    this.resetPoints();
    this.drawPoints([
      this.config.start,
      this.config.end
    ]);
    this.resetLines();
    this.drawLine([
      this.config.start,
      this.config.end
    ]);
  }

  private resetPoints(): void {
    Selection.selectAll('circle').remove();
  }

  private drawPoints(points: Point[]) {
    points.forEach(point => {
      this.svg.append('circle')
        .attr('r', 50)
        .attr('cx', point.x)
        .attr('cy', point.y)
        .attr('fill', '#971240');
    });
  }

  private drawLine(points: Point[]) {
    return this.svg.append('path')
      .attr('d', Shape.line().x(p => p.x).y(p => p.y)(points))
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('fill', 'none');
  }

  private resetLines(): void {
    Selection.selectAll('path').remove();
  }

  private updateConfig(): void {
    this.config = {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight,
      start: {
        x: this.canvas.clientWidth,
        y: 0
      },
      end: {
        x: 0,
        y: this.canvas.clientHeight
      },
    };
    // Emit Canvas Config to parent Component
    this.emitConfig.next(this.config);
  }
}
