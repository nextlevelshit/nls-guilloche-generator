import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Config } from './models/config.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public canvasConfig: Config|null;

  public updateCanvasConfig(config): void {
    this.canvasConfig = config;
  }
}
