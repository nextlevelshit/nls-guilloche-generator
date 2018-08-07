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
  guilloche: {
    colors: {
      primary: '#cb0c4d',
      secondary: '#10c1e8'
    }
  },
  formDefaults: {
    width: 10,
    height: 16,
    scale: 0.1,
    overlap: 1.2,
    vectors: {
      start: 1,
      end: 0,
      range: 0.4,
    },
    nodes: 4,
    stroke: 1,
    spread: 12,
    space: 5
  }
};
