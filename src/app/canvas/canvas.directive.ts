import { Directive, ElementRef, Renderer, AfterViewInit, HostListener, Output, EventEmitter, OnInit } from '@angular/core';
import { Config } from './../models/config.model';

@Directive({
  selector: '[appCanvas]'
})
export class CanvasDirective implements OnInit {
  private canvas: any;
  private context: any;
  public config: Config;

  @Output() emitConfig: EventEmitter<Config>;
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
    this.emitConfig = new EventEmitter();
  }

  ngOnInit() {
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
    // Emit Config to parent Component
    this.emitConfig.next(this.config);
  }
}
