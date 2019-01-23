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

export interface Config {
  margin: {
    x: number;
    y: number;
  };
  start: {
    x: number;
    y: number;
  };
  end: {
    x: number;
    y: number;
  };
  vectors: {
    spacing: number;
    start: any;
    end: any;
    range: any;
  };
  colors: {
    primary: string;
    secondary: string;
  };
  spread: {
    amount: number;
    spacing: number
  };
  animation: {
    interval: number;
    shift: number;
  };
  nodes: any;
  stroke: any;
  overlap: any;
  scale: any;
  date?: Date;
  debug?: boolean;
}
