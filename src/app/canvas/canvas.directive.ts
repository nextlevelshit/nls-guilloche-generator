import { Directive, ElementRef, Renderer, AfterViewInit, HostListener } from '@angular/core';
import { Config } from './../models/config.model';

@Directive({
  selector: '[appCanvas]'
})
export class CanvasDirective implements AfterViewInit {
  private canvas: any;
  private context: any;
  public config: Config;

  @HostListener('window:resize', ['$event'])
  private onResize(event) {
    this.updateConfig();
  }

  constructor(
    private el: ElementRef,
    private renderer: Renderer
  ) {
    this.canvas = el.nativeElement;
    this.context = this.canvas.getContext('2d');
  }

  ngAfterViewInit() {
    this.updateConfig();
  }

  private updateConfig(): void {
    this.config = {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight,
      start: {
        x: this.canvas.clientWidth,
        y: 0
      },
      end: {
        x: 0,
        y: this.canvas.clientHeight
      },
    };
    console.log(this.config);
  }
}
