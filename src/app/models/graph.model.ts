import { Point } from './point.model';

export interface Graph {
  id: string; // ID of SVG group
  start: {
    coords: Point;
    direction: number; // degree between 0 and 360
  };
  end: {
    coords: Point;
    direction: number; // degree between 0 and 360
  };
  landmarks?: Point[]; // orientation points
}
