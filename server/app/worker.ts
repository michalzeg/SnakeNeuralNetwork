import { parentPort } from 'worker_threads';
import { startTraining } from '../../training/main';
import { WorkerRequest, message } from './message';

parentPort!.on(message, (message) => {
    const request = message as WorkerRequest;
    startTraining( request.config,'', (arg) => {
        parentPort?.postMessage({arg,id: request.id});
      });
});
