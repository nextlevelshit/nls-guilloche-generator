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
import { ArithmeticService } from './arithmetic.service';
import { HistoryService } from './history.service';

@Injectable()
export class AnimationService {

  public graphs: Graph[];
  public speed: number;
  public range: number;
  // public genAnimation: any;
  // private timer: Observable<number>;
  // private subscribtion: any;

  constructor(
    private arithmetics: ArithmeticService,
    private historyService: HistoryService,
  ) {
  }

  public animate(initialGraphs: Graph[]) {
    const newGraphs = initialGraphs.slice();

    return newGraphs.map(graph => {

      const newGraph = Object.assign({}, graph);
      const indexMiddle = Math.floor(newGraph.nodes.length * 0.5);
      const pointMiddle = newGraph.nodes[indexMiddle];

      newGraph.nodes.splice(indexMiddle, 1, {
        x: pointMiddle.x - 1,
        y: pointMiddle.y + 1,
      });

      return newGraph;
    });
  }
}

