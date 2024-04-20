import { Config } from '../../training/learning/config';

export interface Buffer {
  id: string;
  startTime: Date;
  endTime: Date;
  config?: Config;
  iteration: number;
  maxLength: number;
}

export const emptyBuffer = (id: string): Buffer => ({id, iteration: 0, maxLength: 0, startTime: new Date(), endTime: new Date() });
