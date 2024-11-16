import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ProgressArg } from '../../../training/src/progress';

@Injectable({
  providedIn: 'root'
})
export class TrainingService {

  private worker!: Worker;


  private progressSub = new Subject<ProgressArg>();
  public progress$ = this.progressSub.asObservable();

  private trainingFinishedSub = new Subject<boolean>();
  public trainingFinished$ = this.trainingFinishedSub.asObservable();


  constructor() {
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker = new Worker(new URL('./training.worker', import.meta.url));
      this.worker.onmessage = ({ data }) => {
        this.progressSub.next(data);
      };

      this.worker.onerror = (ev => console.error("error", ev));

    } else {
      alert("Cannot setup worker");
    }
  }

  public async train(modelName: string): Promise<void> {
    this.trainingFinishedSub.next(false);
    this.worker.postMessage(modelName);
    this.trainingFinishedSub.next(true);
  }

}
