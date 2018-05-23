import { ViewChildren, QueryList, Component, AfterViewInit, ViewChild, Input, OnInit } from '@angular/core';
import * as Selection from 'd3-selection';
import * as Shape from 'd3-shape';
import * as Random from 'd3-random';
import * as Drag from 'd3-drag';

// import { GuillocheComponent } from './../components/guilloche.component';
import { GuillocheDirective } from './../directives/guilloche.directive';
import { Graph } from '../models/graph.model';

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class GraphsComponent implements AfterViewInit, OnInit {

  // public width: number;
  // public height: number;
  public graphs: Graph[];
  public svg: any;

  @Input() config: any;

  @ViewChild('svg') svgElementRef;
  @ViewChild(GuillocheDirective) guillocheViewChild: GuillocheDirective;
  @ViewChildren(GuillocheDirective) guillocheViewChildren: QueryList<GuillocheDirective>;

  ngOnInit() {
    // this.width = 0;
    // this.height = 0;
    this.graphs = [...[{
      id: 'first',
      start: {coords: { x: 0, y: 0 }, direction: this.config.start.direction },
      end: { coords: { x: 0, y: -10 }, direction: this.config.end.direction}
    }, {
      id: 'second',
      start: {coords: { x: 0, y: 0 }, direction: this.config.end.direction },
      end: { coords: { x: 0, y: -10 }, direction: this.config.start.direction}
    }]];
  }

  ngAfterViewInit() {
    this.svg = Selection.select(this.svgElementRef.nativeElement);

    console.log('graph component', this.guillocheViewChildren.toArray());
  }
}
