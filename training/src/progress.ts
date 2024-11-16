

export interface ProgressArg{
  board: number[][];
  snakeLength: number;
  episode: number;
  actionCount: number;
}

export type Progress = (arg: ProgressArg) => void;

