import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import 'common/utils/objectid.js';
import d3 from 'd3';
import { SvgLinearGradient } from '../common/SvgLinearGradient.js';
import {throttle, debounce} from 'common/utils/throttle.js';

@Component({
  selector: 'g[bar]',
  directives: [SvgLinearGradient],
  template: `
    <svg:g>
      <svg:defs>
        <svg:g svg-linear-gradient
          [color]="fill"
          [orientation]="orientation"
          [name]="gradientId"
          [startOpacity]="startOpacity"
        />
      </svg:defs>
      <svg:path
        [attr.d]="path"
        class="viz bar"
        [attr.fill]="gradientFill"
        stroke="none"
        [style.cursor]="'pointer'"
        (click)="click()"
      />
    </svg:g>
  `
})
export class Bar {
  @Input() fill;
  @Input() data;
  @Input() width;
  @Input() height;
  @Input() x;
  @Input() y;
  @Input() orientation;
  @Input() roundEdges = true;
  @Input() offset = 0;

  @Output() clickHandler = new EventEmitter();

  constructor(element: ElementRef){
    this.element = element.nativeElement;
  }

  ngOnInit() {
    this.path = this.calculatePath();

    let pageUrl = window.location.href;
    this.gradientId = 'grad' + ObjectId().toString();
    this.gradientFill = `url(${pageUrl}#${this.gradientId})`;
    this.startOpacity = this.calculateStartOpacity();

    this.loadAnimation();
  }

  loadAnimation() {
    let node = d3.select(this.element).select('.bar');
    let startingPath = this.calculateStartingPath();
    node.attr('d', startingPath)

    this.animateToCurrentForm();
  }

  animateToCurrentForm(){
    let node = d3.select(this.element).select('.bar');
    let path = this.calculatePath();

    node.transition().duration(750)
      .attr('d', this.path);
  }

  calculateStartingPath(){
    let radius = this.calculateRadius(this);
    let path;

    if (this.roundEdges){
      if (this.orientation === 'vertical'){
        path = this.roundedRect(this.x, this.y + this.height, this.width, 0, radius, true, true, false, false);
      } else if (this.orientation === 'horizontal'){
        path = this.roundedRect(this.x, this.y, 0, this.height, radius, false, true, false, true);
      }
    } else {
      if (this.orientation === 'vertical'){
        path = this.roundedRect(this.x, this.y + this.height, this.width, 0, radius, false, false, false, false);
      } else if (this.orientation === 'horizontal'){
        path = this.roundedRect(this.x, this.y, 0, this.height, radius, false, false, false, false);
      }
    }

    return path;
  }

  calculatePath(){
    let radius = this.calculateRadius(this);
    let path;

    if (this.roundEdges){
      if (this.orientation === 'vertical'){
        path = this.roundedRect(this.x, this.y, this.width, this.height, radius, true, true, false, false);
      } else if (this.orientation === 'horizontal'){
        path = this.roundedRect(this.x, this.y, this.width, this.height, radius, false, true, false, true);
      }
    } else {
      path = this.roundedRect(this.x, this.y, this.width, this.height, radius, false, false, false, false);
    }

    return path;
  }

  calculateRadius(){
    let radius = 0;
    if (this.roundEdges){
      radius = 5;
      if (this.height <= radius || this.width <= radius){
        radius = 0;
      }
    }
    return radius;
  }

  calculateStartOpacity(){
    if (this.roundEdges){
      return 0;
    } else {
      return 0.5;
    }
  }

  roundedRect(x, y, w, h, r, tl, tr, bl, br) {
    var retval;
    retval  = "M" + (x + r) + "," + y;
    retval += "h" + (w - 2*r);
    if (tr) { retval += "a" + r + "," + r + " 0 0 1 " + r + "," + r; }
    else { retval += "h" + r; retval += "v" + r; }
    retval += "v" + (h - 2*r);
    if (br) { retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + r; }
    else { retval += "v" + r; retval += "h" + -r; }
    retval += "h" + (2*r - w);
    if (bl) { retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + -r; }
    else { retval += "h" + -r; retval += "v" + -r; }
    retval += "v" + (2*r - h);
    if (tl) { retval += "a" + r + "," + r + " 0 0 1 " + r + "," + -r; }
    else { retval += "v" + -r; retval += "h" + r; }
    retval += "z";
    return retval;
  }

  click(){
    this.clickHandler.emit(this.data);
  }

}