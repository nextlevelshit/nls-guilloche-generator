import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { GraphsComponent } from './components/graphs.component';
import { GuillocheDirective } from './directives/guilloche.directive';
import { CanvasService } from './services/canvas.service';

@NgModule({
  declarations: [
    AppComponent,
    GraphsComponent,
    GuillocheDirective
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [
    CanvasService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
