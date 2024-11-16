import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { defaultConfig } from '../../../../training/src/config';
import { copyArray, initalizeBoardArray } from '../../../../training/utils/utils';
import { TrainingService } from '../training.service';
@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardComponent implements OnInit {

  size = defaultConfig.environmentConfig.boardSize;
  visibility = defaultConfig.environmentConfig.snakeVisibility;
  board: number[][] = [];


  constructor(private readonly domainService: TrainingService, private readonly detector: ChangeDetectorRef) {
    this.domainService.progress$.subscribe(e => {
      copyArray(e.board, this.board);
      this.detector.detectChanges();
    });
  }
  ngOnInit(): void {
    this.board = initalizeBoardArray(this.size);
  }


  getClass(top: number, left: number) {
    if (!this.board) {
      return ""
    }

    const value = this.board[top][left];

    if (value === 0) {
      return "snake-head";
    }
    else if (value === -2) {
      return "fruit";
    }
    else if (value > 0) {
      return "snake-body";
    }
    else if (value === -3) {
      return "obstacle";
    }
    else if (this.isVisibleBySnake(top, left)) {
      return "visibility";
    }

    return "";
  }


  private isVisibleBySnake(top: number, left: number): boolean {

    for (let i = -this.visibility; i <= this.visibility; i++) {
      for (let j = -this.visibility; j <= this.visibility; j++) {
        const dt = top + i;
        const dl = left + j;

        if (dt < 0 || dt > this.size - 1 || dl < 0 || dl > this.size - 1) {
          continue;
        }

        const value = this.board[dt][dl];
        if (value === 0) {
          return true;
        }

      }
    }
    return false;
  }

}
