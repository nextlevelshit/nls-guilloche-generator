import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CanvasDirective } from './directives/canvas.directive';
import { GraphsComponent } from './components/graphs.component';
// import { GuillocheComponent } from './components/guilloche.component';
import { GuillocheDirective } from './directives/guilloche.directive';

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
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
