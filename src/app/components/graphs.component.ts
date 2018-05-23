import { ViewChildren, QueryList, Component, AfterViewInit, ViewChild, Input, SimpleChanges, OnChanges, HostListener } from '@angular/core';
import * as Selection from 'd3-selection';
import * as Shape from 'd3-shape';
import * as Random from 'd3-random';
import * as Drag from 'd3-drag';

import { environment as env } from '../../environments/environment';
import { GuillocheDirective } from './../directives/guilloche.directive';
import { CanvasService } from './../services/canvas.service';
import { Graph } from '../models/graph.model';
import { Config } from './../models/config.model';
import { Point } from '../models/point.model';

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class GraphsComponent implements AfterViewInit, OnChanges {

  public graphs: Graph[];
  public canvas: any | null;

  @Input() config: any;

  @ViewChild('svg') svgElementRef;
  @ViewChild(GuillocheDirective) guillocheViewChild: GuillocheDirective;
  @ViewChildren(GuillocheDirective) guillocheViewChildren: QueryList<GuillocheDirective>;

  @HostListener('window:resize', ['$event'])
  private onResize(event) {
    this.init();
  }

  constructor(
    private canvasService: CanvasService
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('graph component (changes:config)', changes.config.currentValue);
    this.init();
  }

  /**
   * @todo Will deprecate if there won't be any use for this
   */
  ngAfterViewInit() {
    console.log('graph component (afterView:children)', this.guillocheViewChildren.toArray());
  }

  private init() {
    this.updateCanvas();
    this.updateGraphs();
  }

  private updateGraphs(): void {
    const matrix = this.matrix;

    this.graphs = [...[this.adjustGraph('start'), this.adjustGraph('end')]];
  }

  private adjustGraph(from: string) {
    const matrix = this.matrix;
    const to = this.flipflop(from);

    return {
      start: {
        coords: { x: matrix[from].x, y: matrix[from].y },
        direction: this.config.directionStart,
        color: env.guilloche.colors[from]
      }, end: {
        coords: { x: matrix[to].x, y: matrix[to].y },
        direction: this.config.directionEnd,
        color: env.guilloche.colors[to]
      },
      stroke: this.config.stroke,
      nodes: []
    };

    // {
    //   start: {
    //     coords: { x: matrix.end.x, y: matrix.end.y },
    //     direction: this.config.directionEnd,
    //     color: env.guilloche.colors.start
    //   }, end: {
    //     coords: { x: matrix.start.x, y: matrix.start.y },
    //     direction: this.config.directionStart,
    //     color: env.guilloche.colors.end
    //   },
    //   stroke: this.config.stroke,
    //   nodes: []
    // }
  }

  private flipflop(direction: string) {
    return (direction === 'start') ? 'end' : 'start';
  }

  private updateCanvas(): void {
    this.canvas = this.svgElementRef.nativeElement;
    this.canvasService.set(this.canvas);
  }

  private centerPoint(width, height): Point {
    return {
      x: width * 0.5,
      y: height * 0.5
    };
  }

  private get matrix() {
    const totalArea = Math.abs(this.canvas.clientWidth * this.canvas.clientHeight);
    const totalCenter = this.centerPoint(this.canvas.clientWidth, this.canvas.clientHeight);

    const baseArea = Math.abs(this.config.width * this.config.height);
    const baseScale = Math.pow(totalArea / baseArea * this.config.scale, 0.5);
    const baseCenter = this.centerPoint( baseScale * this.config.width, baseScale * this.config.height);

    return {
      start: {
        x: totalCenter.x - baseCenter.x,
        y: totalCenter.y + baseCenter.y
      },
      end: {
        x: totalCenter.x + baseCenter.x,
        y: totalCenter.y - baseCenter.y
      }
    };
  }
}
