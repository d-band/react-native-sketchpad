import Point, { BasicPoint } from './point';

export default class Bezier {
  public static fromPoints(points: Point[]): Bezier {
    const { c1, c2 } = this.calcControlPoints(points[0], points[1], points[2]);
    return new Bezier(points[1], c1, c2, points[2]);
  }

  private static calcControlPoints(
    s1: BasicPoint,
    s2: BasicPoint,
    s3: BasicPoint
  ): {
    c1: BasicPoint;
    c2: BasicPoint;
  } {
    const dx1 = s1.x - s2.x;
    const dy1 = s1.y - s2.y;
    const dx2 = s2.x - s3.x;
    const dy2 = s2.y - s3.y;

    const m1 = { x: (s1.x + s2.x) / 2.0, y: (s1.y + s2.y) / 2.0 };
    const m2 = { x: (s2.x + s3.x) / 2.0, y: (s2.y + s3.y) / 2.0 };

    const l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    const dxm = m1.x - m2.x;
    const dym = m1.y - m2.y;

    const k = l2 / (l1 + l2);
    const cm = { x: m2.x + dxm * k, y: m2.y + dym * k };

    const tx = s2.x - cm.x;
    const ty = s2.y - cm.y;

    return {
      c1: new Point(m1.x + tx, m1.y + ty),
      c2: new Point(m2.x + tx, m2.y + ty),
    };
  }

  constructor(
    public start: Point,
    public c1: BasicPoint,
    public c2: BasicPoint,
    public end: Point
  ) {}

  isValid() {
    return (
      !Number.isNaN(this.c1.x) &&
      !Number.isNaN(this.c1.y) &&
      !Number.isNaN(this.c2.x) &&
      !Number.isNaN(this.c2.y)
    );
  }

  toPath() {
    return [
      `M ${this.start.x.toFixed(3)},${this.start.y.toFixed(3)}`,
      `C ${this.c1.x.toFixed(3)},${this.c1.y.toFixed(3)}`,
      `${this.c2.x.toFixed(3)},${this.c2.y.toFixed(3)}`,
      `${this.end.x.toFixed(3)},${this.end.y.toFixed(3)}`,
    ].join(' ');
  }
}
