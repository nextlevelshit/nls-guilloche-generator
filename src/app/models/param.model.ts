export interface Param {
  colors: {
    start: string,
    end: string
  };
  points: number;
  margin: {
    x: number,
    y: number
  };
  spread: number;
  stroke?: {
    width: number;
  };
  showGrid?: boolean;
}
