import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { NlsGraphsComponent } from './components/graphs.component';
import { NlsGuillocheDirective } from './directives/guilloche.directive';
import { NlsHistoryService } from './services/history.service';
import { NlsCanvasService } from './services/canvas.service';
import { NlsMathService } from './services/math.service';
import { NlsGraphService } from './services/graph.service';

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    NlsGraphsComponent,
    NlsGuillocheDirective
  ],
  providers: [
    NlsHistoryService,
    NlsCanvasService,
    NlsMathService,
    NlsGraphService,
  ],
  exports: [
    NlsGraphsComponent,
    NlsGuillocheDirective,
  ]
})
export class NlsGuillocheModule {}
