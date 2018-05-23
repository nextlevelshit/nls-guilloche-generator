import { ViewChildren, QueryList, Component, AfterViewInit, ViewChild, Input, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import * as Selection from 'd3-selection';
import * as Shape from 'd3-shape';
import * as Random from 'd3-random';
import * as Drag from 'd3-drag';

import { GuillocheDirective } from './../directives/guilloche.directive';
import { Graph } from '../models/graph.model';

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class GraphsComponent implements AfterViewInit, OnInit, OnChanges {

  public graphs: Graph[];
  public svg: any;

  @Input() config: any;

  @ViewChild('svg') svgElementRef;
  @ViewChild(GuillocheDirective) guillocheViewChild: GuillocheDirective;
  @ViewChildren(GuillocheDirective) guillocheViewChildren: QueryList<GuillocheDirective>;

  ngOnInit() {
    this.updateGraphs();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('graph component (changes)', changes.config);

    this.updateGraphs();
  }

  ngAfterViewInit() {
    this.svg = Selection.select(this.svgElementRef.nativeElement);

    console.log('graph component (after view)', this.guillocheViewChildren.toArray());
  }

  private updateGraphs(): void {
    this.graphs = [...[{
      id: 'first',
      start: {coords: { x: 0, y: 0 }, direction: this.config.directionStart },
      end: { coords: { x: 0, y: -10 }, direction: this.config.directionEnd}
    }, {
      id: 'second',
      start: {coords: { x: 0, y: 0 }, direction: this.config.directionEnd },
      end: { coords: { x: 0, y: -10 }, direction: this.config.directionStart}
    }]];
  }
}
