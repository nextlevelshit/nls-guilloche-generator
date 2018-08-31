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

import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import * as Selection from 'd3-selection';

@Injectable()
export class NlsCanvasService {
  private renderer: Renderer2;

  public canvas: any;

  constructor(
    private rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  public get get() {
    return this.canvas;
  }

  public set(el) {
    this.canvas = el;
  }

  public adjustToWindow() {
    if (this.canvas) {
      this.renderer.setStyle(
        this.canvas,
        'width',
        window.innerWidth
      );
      this.renderer.setStyle(
        this.canvas,
        'height',
        window.innerHeight
      );
    }
  }
}
