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

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

const fb = new FormBuilder();

export let ConfigForm: FormGroup = fb.group({
  canvas: fb.group({
    width: fb.control('', Validators.required),
    height: fb.control('', Validators.required)
  }),
  colors: fb.group({
    primary: fb.control('', Validators.required),
    secondary: fb.control('', Validators.required)
  }),
  margin: fb.group({
    x: fb.control('', Validators.compose([
      Validators.min(0),
      Validators.max(1)
    ])),
    y: fb.control('', Validators.compose([
      Validators.min(0),
      Validators.max(1)
    ]))
  }),
  vectors: fb.group({
    start: fb.control('', Validators.compose([
      Validators.min(0),
      Validators.max(2)
    ])),
    end: fb.control('', Validators.compose([
      Validators.min(0),
      Validators.max(2)
    ])),
    tension: fb.control('', Validators.compose([
      Validators.min(0),
      Validators.max(1)
    ])),
    spacing: fb.control('', Validators.compose([
      Validators.min(0),
      Validators.max(100)
    ])),
  }),
  nodes: fb.control('', Validators.compose([
    Validators.min(2),
    Validators.max(20)
  ])),
  scale: fb.control('', Validators.compose([
    Validators.min(0),
    Validators.max(10)
  ])),
  stroke: fb.control('', Validators.compose([
    Validators.min(0.1),
    Validators.max(10)
  ])),
  overlap: fb.control('', Validators.min(0.1)),
  spread: fb.group({
    amount: fb.control('', Validators.min(1)),
    spacing: fb.control('', Validators.compose([
      Validators.min(0),
      Validators.max(200)
    ])),
  }),
  animation: fb.group({
    interval: fb.control('', Validators.compose([
      Validators.min(50),
      Validators.max(10000)
    ])),
    shift: fb.control('', Validators.compose([
      Validators.min(0.1),
      Validators.max(200)
    ])),
    amplitude: fb.control('', Validators.compose([
      Validators.min(0),
      Validators.max(3)
    ])),
    ticksTotal: fb.control('', Validators.compose([
      Validators.min(50),
      Validators.max(3000)
    ])),
    frequency: fb.control('', Validators.compose([
      Validators.min(2),
      Validators.max(100)
    ])),
    radius: fb.control('', Validators.compose([
      Validators.min(0.01),
      Validators.max(1)
    ])),
    enabled: fb.control('')
  }),

});
