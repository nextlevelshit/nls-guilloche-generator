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
// import { Moment } from 'moment';
import * as moment from 'moment';
import 'moment/min/locales';

import { environment as env } from '../environments/environment';
import { Param } from './models/param.model';
import { Config } from './models/config.model';
import { CanvasService } from './services/canvas.service';
import { HistoryService } from './services/history.service';
import { Graph } from './models/graph.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public canvasParam: Param;
  public config: any | null;
  public configForm: FormGroup;
  public url: any;
  public list: any[];
  public showList: boolean;
  public restoredHistory: any;
  public animationActive: boolean;

  constructor(
    private canvasService: CanvasService,
    private historyService: HistoryService,
  ) {
    moment.locale('de');

    this.config = env.formDefaults;
    this.configForm = ConfigForm;
    this.list = [];
    this.showList = true;
    this.animationActive = false;
  }

  ngOnInit() {
    this.configForm.reset({...this.config});
    this.list = this.historyService.list();
    // console.log(this.graphs);
  }

  public updateGraphs() {
    this.config = {...this.configForm.value};
    this.list = this.historyService.list();
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
    // const blob = new Blob(
    //   [this.canvasService.get],
    //   {type: 'image/svg+xml;charset=utf-8'}
    // );
    // link.href = URL.createObjectURL(blob);
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
}
