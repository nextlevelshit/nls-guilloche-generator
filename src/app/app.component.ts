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
import { NlsHistoryService } from 'projects/nls-guilloche/src/public_api';

export enum KEY_CODE {
  ESCAPE = 27
}

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
  public animationEnabled: boolean;
  public isFullscreen: boolean;

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === KEY_CODE.ESCAPE) {
      this.disableFullscreen();
    }
  }

  constructor(
    private historyService: NlsHistoryService,
  ) {
    moment.locale('de');

    this.config = {
      ...env.config,
      ...env.formDefaults
    };
    this.configForm = ConfigForm;
    this.list = [];
    this.showList = false;
    this.isFullscreen = false;
    this.animationEnabled = env.formDefaults.animation.enabled;
  }

  ngOnInit() {
    this.resetForm();
    this.refreshHistory();

    this.configForm.valueChanges.subscribe(() => {
      this.updateGraphs();
    });
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

  public toggleList(): void {
    this.showList = !this.showList;
  }

  public enableFullscreen(): void {
    this.isFullscreen = true;
    document.body.classList.add('fullscreen');
    this.updateGraphs();
  }

  public disableFullscreen(): void {
    this.isFullscreen = false;
    document.body.classList.remove('fullscreen');
    this.updateGraphs();
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
