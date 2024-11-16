/// <reference lib="webworker" />

import { defaultConfig } from '../../../training/src/config';
import { startTraining } from '../../../training/main'
import { WorkerMsg } from './messages';

addEventListener(WorkerMsg, event => {
  const modelName = event.data as string;
  startTraining(defaultConfig, modelName, arg => {
    postMessage(arg)
  });
});
