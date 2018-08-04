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

import { Point } from './point.model';

export interface Graph {
  id: string;
  start: {
    coords: Point;
    direction: number; // degree between 0 and 360
    color: string // can be set in enviroment
  };
  end: {
    coords: Point;
    direction: number; // degree between 0 and 360
    color: string; // can be set in enviroment
  };
  stroke: number; // stroke width
  nodes?: Point[]; // orientation points
}
