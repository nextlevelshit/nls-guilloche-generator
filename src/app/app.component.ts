
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

export enum CANVAS {
  MARGIN = 100,
  TIMEOUT = 400
}

export enum DELAY {
  INPUT = 200
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private inputDelay: any;

  public config: any | null;
  public configForm: FormGroup;
  public url: any;
  public list: any[];
  public showList: boolean;
  public restoredHistory: any;
  public isFullscreen: boolean;
  public presetForm: FormGroup;
  public presets: any;

  @ViewChild('canvasRef', { read: ElementRef }) canvasRef: ElementRef;
  @ViewChild('containerRef', { read: ElementRef }) containerRef: ElementRef;

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
  }

  ngOnInit() {
    this.refreshHistory();
    this.resetForm();
    this.resetCanvas();
    this.resetPresetForm();

    this.configForm.valueChanges.subscribe((res) => {
      if (this.inputDelay) {
        clearTimeout(this.inputDelay);
      }
      this.inputDelay = setTimeout(() => {
        this.presetForm.value.canvas = null;
        this.resetCanvas();
        this.updateGraphs();
      }, DELAY.INPUT);
    });

    this.presetForm.valueChanges.subscribe((res) => {
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

  private resetCanvas(): void {
    const dimensions = this.configForm.value.canvas;
    const canvasEl = this.canvasRef.nativeElement;

    canvasEl.style.width = dimensions.width + 'px';
    canvasEl.style.height = dimensions.height + 'px';
  }

  private refreshHistory(): void {
    this.list = this.historyService.list();
  }

  public updateGraphs(): void {
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

  public prepareSvgExport(svg): void {
    const blob = new Blob(
      [svg.nativeElement.outerHTML],
      {type: 'image/svg+xml;charset=utf-8'}
    );
    this.url = URL.createObjectURL(blob);
  }

  public exportSvg(): void {
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

  public restoreGraph(history): void {
    this.configForm.reset({...history.config}, {emitEvent: false});
    this.restoredHistory = history;
  }

  public get animationEnabled(): boolean {
    return this.config.animation.enabled;
  }
}
