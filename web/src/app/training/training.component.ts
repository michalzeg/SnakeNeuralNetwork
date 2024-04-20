import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DomainService } from '../domain.service';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrainingComponent implements OnInit{

  modelName = uuidv4();

  maxSnakeLength = 0;
  currentLength = 0;
  episode = 0;
  actionCount = 0;

  episodeSnakeLengthMap: Map<number,number> = new Map<number,number>();
  snakeLengthStats: { length: number, count: number }[] = [];

  constructor(
    private domainService: DomainService,
    private readonly detector: ChangeDetectorRef
    ) {

  }
  ngOnInit(): void {
    this.domainService.progress$.subscribe(e=>{
      this.currentLength = e.snakeLength;
      this.maxSnakeLength = this.maxSnakeLength < e.snakeLength ? e.snakeLength : this.maxSnakeLength;
      this.episode = e.episode;
      this.actionCount = e.actionCount;
      this.updateStats(e.episode,e.snakeLength);
      this.detector.detectChanges();
    });
  }

  public async train(): Promise<void>{
    await this.domainService.train(this.modelName);
  }

  private updateStats(episode: number, snakeLength: number){
      this.episodeSnakeLengthMap.set(episode, snakeLength);

      const groupedValues = [...this.episodeSnakeLengthMap.values()].reduce((countMap, num) => {
        countMap.set(num, (countMap.get(num) || 0) + 1);
        return countMap;
      }, new Map<number, number>())

      this.snakeLengthStats = [...groupedValues.entries()].map(([length, count]) => ({length, count})).sort((a,b)=>a.length - b.length);
  }
}
