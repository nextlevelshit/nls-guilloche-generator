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
import * as Selection from 'd3-selection';

import { Graph } from '../models/graph.model';

@Injectable()
export class HistoryService {

  public history: any[];

  constructor() {
    this.history = [];
  }

  public save(graphs: Graph[], config) {
    this.history.push({
      date: new Date(),
      graphs: graphs,
      config: config,
      hash: this.hash(graphs)
    });
  }

  public hash(graphs) {
    return btoa(JSON.stringify([graphs]));
  }

  public list() {
    return this.history;
  }

  public restore(graphs: Graph[]) {
    console.log(graphs);
  }

}

