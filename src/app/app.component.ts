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
import { Component, OnInit, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as moment from 'moment';
import 'moment/min/locales';

import { environment as env } from '../environments/environment';
import { Config } from './../../projects/nls-guilloche/src/nls/models/config.model';
import { Graph } from './../../projects/nls-guilloche/src/nls/models/graph.model';
import { NlsCanvasService } from './../../projects/nls-guilloche/src/nls/services/canvas.service';
import { NlsHistoryService } from './../../projects/nls-guilloche/src/nls/services/history.service';
import { NlsGraphService } from './../../projects/nls-guilloche/src/nls/services/graph.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public config: any | null;
  public configForm: FormGroup;
  public url: any;
  public list: any[];
  public showList: boolean;
  public restoredHistory: any;
  public animationActive: boolean;

  constructor(
    private canvasService: NlsCanvasService,
    private historyService: NlsHistoryService,
    private graphService: NlsGraphService,
  ) {
    moment.locale('de');

    this.config = {
      colors: {
        primary: env.guilloche.colors.primary,
        secondary: env.guilloche.colors.secondary,
      },
      ...env.formDefaults
    };
    this.configForm = ConfigForm;
    this.list = [];
    this.showList = true;
    this.animationActive = env.animation;
  }

  ngOnInit() {
    this.resetForm();
    this.refreshHistory();
  }

  private resetForm() {
    this.configForm.reset({...this.config});
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

  public toggleList() {
    this.showList = !this.showList;
  }

  public restoreGraph(history) {
    this.configForm.reset({...history.config});
    this.restoredHistory = history;
  }

  public startAnimation() {
    this.animationActive = true;
  }

  public stopAnimation() {
    this.animationActive = false;
  }
}
