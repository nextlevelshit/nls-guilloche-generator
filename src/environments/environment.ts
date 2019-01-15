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
  animation: false,
  animationInterval: 30,
  config: {
    colors: {
      secondary: '#F8485E',
      primary: '#5CC0C7'
    }
  },
  formDefaults: {
    debug: true,
    margin: {
      x: 0,
      y: 0
    },
    scale: 0.4,
    overlap: 0.5,
    vectors: {
      start: 0.5,
      end: 0,
      range: 0.2,
      spacing: 0
    },
    nodes: 4,
    stroke: 1,
    spread: {
      amount: 20,
      spacing: 7
    },
    interval: 30
  }
};
