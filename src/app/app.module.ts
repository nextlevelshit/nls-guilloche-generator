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

import { BrowserModule } from '@angular/platform-browser';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';

import { AppComponent } from './app.component';
import { NlsGraphsComponent } from 'projects/nls-guilloche/src/public_api';
import { NlsGuillocheDirective } from 'projects/nls-guilloche/src/public_api';
import { NlsCanvasService } from 'projects/nls-guilloche/src/public_api';
import { NlsHistoryService } from 'projects/nls-guilloche/src/public_api';
import { NlsAnimationService } from 'projects/nls-guilloche/src/public_api';
import { NlsMathService } from 'projects/nls-guilloche/src/public_api';
import { NlsGraphService } from 'projects/nls-guilloche/src/public_api';

@NgModule({
  declarations: [
    AppComponent,
    NlsGraphsComponent,
    NlsGuillocheDirective
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    MomentModule,
  ],
  providers: [
    NlsCanvasService,
    NlsHistoryService,
    NlsAnimationService,
    NlsMathService,
    NlsGraphService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
