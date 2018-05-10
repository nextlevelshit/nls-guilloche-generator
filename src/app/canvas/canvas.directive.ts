import { Point } from './../models/point.model';
import { Directive, ElementRef, Renderer, AfterViewInit, HostListener, Output, EventEmitter, OnInit } from '@angular/core';
import { Config } from './../models/config.model';
import * as d3 from 'd3';

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
    this.updateConfig();

    if (this.svg) {
      this.updateSvg();
    } else {
      this.initSvg();
    }
  }

  constructor(
    private el: ElementRef,
    private renderer: Renderer
  ) {
    this.canvas = el.nativeElement;
    this.emitConfig = new EventEmitter();
  }

  ngOnInit() {
    this.updateConfig();
    this.initSvg();
    this.render();
  }

  private initSvg() {
    this.svg = d3.select(this.canvas).append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height);
  }

  private updateSvg() {
    this.svg
      .attr('width', this.config.width)
      .attr('height', this.config.height);
  }

  private render() {
    this.drawLine([
      this.config.start,
      this.config.end
    ]);
  }

  private drawLine(points: Point[]) {
    // d3.line()
    //   .x(function(d) { return x(d.date); })
    //   .y(function(d) { return y(d.value); })
    //   .curve(d3.curveCatmullRom.alpha(0.5));
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
