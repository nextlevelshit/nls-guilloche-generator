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

import { Inject, Injectable, Optional, ViewChild } from '@angular/core';
import { interval, Observable } from 'rxjs';
import * as Selection from 'd3-selection';

import { Graph } from '../models/graph.model';
import { NlsMathService } from './math.service';
import { NlsHistoryService } from './history.service';

@Injectable()
export class NlsAnimationService {

  public graphs: Graph[];
  public speed: number;
  public tension: number;
  // public genAnimation: any;
  // private timer: Observable<number>;
  // private subscribtion: any;

  constructor(
    private math: NlsMathService,
    private historyService: NlsHistoryService,
  ) {
  }

  // public animate(initialGraphs: Graph[]) {
  public animate(initialGraph: Graph) {
    // const newGraphs = initialGraphs.slice();

    // return newGraphs.map(graph => {

      const newGraph = Object.assign({}, initialGraph);
      const indexMiddle = Math.floor(newGraph.nodes.length * 0.5);
      const pointMiddle = newGraph.nodes[indexMiddle];

      newGraph.nodes.splice(indexMiddle, 1, {
        x: pointMiddle.x - 2,
        y: pointMiddle.y + 2,
      });

      return newGraph;
  //   });
  }
}

