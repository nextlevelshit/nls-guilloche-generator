import { Point } from './point.model';

export interface Graph {
  start: {
    coords: Point;
    direction: number; // degree between 0 and 360
    color: string // can be set in enviroment
  };
  end: {
    coords: Point;
    direction: number; // degree between 0 and 360
    color: string; // can be set in enviroment
  };
  stroke: number; // stroke width
  nodes?: Point[]; // orientation points
}
