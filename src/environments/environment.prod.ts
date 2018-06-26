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
  guilloche: {
    colors: {
      start: '#f16363',
      end: '#5eb1bd'
    }
  },
  controls: {
    wheelStep: 0.01
  },
  formDefaults: {
    width: 9,
    height: 16,
    vectors: {
      start: 1,
      end: 0,
      range: 0.3
    },
    nodes: 2,
    stroke: 1,
    scale: 0.3,
    overlap: 3,
    spread: 4
  }
};
