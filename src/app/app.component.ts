
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
import { ConfigForm } from './forms/config.form';
import { PresetForm } from './forms/preset.form';
import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as moment from 'moment';
import 'moment/min/locales';
import { CanvasPresets } from './presets/canvas.preset';

import { environment as env } from '../environments/environment';
import { NlsHistoryService } from 'projects/nls-guilloche/src/public_api';

export enum KEY_CODE {
  ESCAPE = 27
}

export enum CANVAS {
  MARGIN = 100,
  TIMEOUT = 400
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private resizingWindow: any;

  public config: any | null;
  public configForm: FormGroup;
  public url: any;
  public list: any[];
  public showList: boolean;
  public restoredHistory: any;
  public animationEnabled: boolean;
  public isFullscreen: boolean;
  public presetForm: FormGroup;
  public presets: any;

  @ViewChild('canvasRef', { read: ElementRef }) canvasRef: ElementRef;
  @ViewChild('containerRef', { read: ElementRef }) containerRef: ElementRef;

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === KEY_CODE.ESCAPE) {
      this.disableFullscreen();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    clearTimeout(this.resizingWindow);

    this.resizingWindow = setTimeout(() => {
      this.resetCanvas(this.configForm.value.canvas);
    }, CANVAS.TIMEOUT);
  }

  constructor(
    private historyService: NlsHistoryService,
  ) {
    moment.locale('de');

    this.configForm = ConfigForm;
    this.presetForm = PresetForm;
    this.presets = {
      canvas: CanvasPresets
    };
    this.list = [];
    this.showList = false;
    this.isFullscreen = false;
    this.animationEnabled = env.formDefaults.animation.enabled;
  }

  ngOnInit() {
    this.refreshHistory();
    this.resetCanvas(env.formDefaults.canvas);
    this.resetForm();
    this.resetPresetForm();

    this.configForm.valueChanges.subscribe(() => {
      this.presetForm.value.canvas = null;
      this.resetCanvas(this.configForm.value.canvas);
      this.updateGraphs();
    });

    this.presetForm.valueChanges.subscribe(() => {
      if (this.presetForm.value.canvas !== null) {
        this.config = {
          ...this.config,
          ...this.presets.canvas[this.presetForm.value.canvas].defaults
        };
        this.configForm.reset({...this.config});
      }
    });
  }

  private resetPresetForm(): void {
    this.presetForm.reset({
      canvas: null
    });
  }

  private resetForm(): void {
    this.config = {
      ...this.config,
      ...env.formDefaults
    };
    this.configForm.reset({...this.config});
  }

  private resetCanvas(dimensions: { width: number, height: number}): void {
    const container = {
      el: this.containerRef.nativeElement,
      width: this.containerRef.nativeElement.clientWidth,
      height: this.containerRef.nativeElement.clientHeight,
      aspectRatio: function() {
        return this.width / this.height;
      }
    };
    const canvas = {
      el: this.canvasRef.nativeElement,
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio: function() {
        return this.width / this.height;
      }
    };
    let unit = 1;

    if (container.aspectRatio() > canvas.aspectRatio()) {
      // fit canvas by height to conainter
      unit = container.height / canvas.height;
    } else {
      // fit canvas by width to container
      unit = container.width / canvas.width;
    }

    canvas.el.style.width =
      canvas.width *
      unit -
      CANVAS.MARGIN +
      'px';

    canvas.el.style.height =
      canvas.height *
      unit -
      CANVAS.MARGIN +
      'px';
  }

  private refreshHistory() {
    this.list = this.historyService.list();
  }

  public updateGraphs() {
    this.config = Object.assign(
      {
        ...this.config,
        // Adding date to force ngChange event of graphs component
        date: new Date()
      },
      // Override config with new form values
      this.configForm.value
    );
    this.refreshHistory();
  }

  public prepareSvgExport(svg) {
    const blob = new Blob(
      [svg.nativeElement.outerHTML],
      {type: 'image/svg+xml;charset=utf-8'}
    );
    this.url = URL.createObjectURL(blob);
  }

  public exportSvg() {
    const link = document.createElement('a');
    link.href = this.url;
    link.download = 'guilloche.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public toggleList(): void {
    this.showList = !this.showList;
  }

  public enableFullscreen(): void {
    if (!this.isFullscreen) {
      this.isFullscreen = true;
      document.body.classList.add('fullscreen');
      this.updateGraphs();
    }
  }

  public disableFullscreen(): void {
    if (this.isFullscreen) {
      this.isFullscreen = false;
      document.body.classList.remove('fullscreen');
      this.updateGraphs();
    }
  }

  public restoreGraph(history) {
    this.configForm.reset({...history.config});
    this.restoredHistory = history;
  }

  public startAnimation() {
    this.animationEnabled = true;
  }

  public stopAnimation() {
    this.animationEnabled = false;
  }
}
