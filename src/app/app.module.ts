import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CanvasDirective } from './directives/canvas.directive';
import { GraphsComponent } from './components/graphs.component';
// import { GuillocheComponent } from './components/guilloche.component';
import { GuillocheDirective } from './directives/guilloche.directive';
import { CanvasService } from './services/canvas.service';

@NgModule({
  declarations: [
    AppComponent,
    GraphsComponent,
    // GuillocheComponent,
    CanvasDirective,
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
