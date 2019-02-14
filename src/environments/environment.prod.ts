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

export const environment = {
  production: true,
  debug: false,
  config: {
  },
  formDefaults: {
    colors: {
      secondary: '#F8485E',
      primary: '#5CC0C7'
    },
    debug: false,
    canvas: {
      width: 284,
      height: 482
    },
    margin: {
      x: 28,
      y: 272
    },
    overlap: 0.4,
    vectors: {
      start: 0.5,
      end: 0,
      tension: 0.1,
      spacing: 4
    },
    nodes: 4,
    stroke: 0.7,
    spread: {
      amount: 13,
      spacing: 14
    },
    animation: {
      enabled: false,
      radius: 0.5,
      amplitude: 0.6,
      frequency: 15,
      ticksTotal: 10
    }
  }
};
