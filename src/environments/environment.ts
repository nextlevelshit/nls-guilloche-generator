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
  production: false,
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
      width: 1,
      height: 1.41,
    },
    margin: {
      x: 0.0282,
      y: 0.02
    },
    overlap: 1.3,
    vectors: {
      start: 0.5,
      end: 0,
      tension: 0.2,
      spacing: 5
    },
    nodes: 4,
    stroke: 0.6,
    spread: {
      amount: 22,
      spacing: 10
    },
    animation: {
      enabled: false,
      shift: 14,
      interval: 6000
    }
  }
};
