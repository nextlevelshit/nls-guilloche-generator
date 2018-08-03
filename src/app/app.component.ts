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

import { environment as env } from '../environments/environment';
import { Param } from './models/param.model';
import { Config } from './models/config.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public canvasParam: Param;
  public config: any | null;
  public configForm: FormGroup;
  public scaleOnWheel: boolean;

  constructor() {
    this.config = env.formDefaults;
    this.configForm = ConfigForm;
  }

  ngOnInit() {
    this.configForm.reset({...this.config});
  }

  public updateGraphs() {
    this.config = {...this.configForm.value};
  }

  public exportSvg() {
    alert('Feature coming');
  }
}
