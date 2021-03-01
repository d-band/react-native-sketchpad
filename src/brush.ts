import type Point from './point';

export interface Brush {
  color: string;
  dotSize: () => number;
  reset: () => void;
  calcWidth: (start: Point, end: Point) => number;
}

export class SoftBrush implements Brush {
  private lastVelocity: number;
  private lastWidth: number;

  constructor(
    public color: string,
    public minWidth: number,
    public maxWidth: number,
    public weight: number = 0.9
  ) {
    this.lastVelocity = 0;
    this.lastWidth = (minWidth + maxWidth) / 2;
  }

  calcStrokeWidth(velocity: number) {
    return Math.max(this.maxWidth / (velocity + 1), this.minWidth);
  }

  dotSize() {
    return (this.minWidth + this.maxWidth) / 2;
  }

  reset() {
    this.lastVelocity = 0;
    this.lastWidth = this.dotSize();
  }

  calcWidth(start: Point, end: Point) {
    const velocity =
      this.weight * end.velocityFrom(start) +
      (1 - this.weight) * this.lastVelocity;
    const newWidth = this.calcStrokeWidth(velocity);
    const widths = { end: newWidth, start: this.lastWidth };

    this.lastVelocity = velocity;
    this.lastWidth = newWidth;
    return (widths.start + widths.end) / 2;
  }
}

export class HardBrush implements Brush {
  constructor(public color: string, public width: number) {}

  dotSize() {
    return this.width;
  }

  reset() {}

  calcWidth(_start: Point, _end: Point) {
    return this.width;
  }
}
