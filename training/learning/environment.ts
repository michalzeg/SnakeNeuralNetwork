import { Action } from "./actions";
import { copyArray, random } from "../utils/utils";
import { MoveResult, failedResult, successfulResult } from "./move-result";
import { State } from "./state";
import { EnvironmentConfig } from "./config";
export class Environment {

  private readonly board: number[][] = [];

  private headTop!: number;
  private headLeft!: number;
  private fruitTop!: number;
  private fruitLeft!: number;
  private snakeLength = 1;


  constructor(private readonly config: EnvironmentConfig) {
    for (let top = 0; top < this.config.boardSize; top++) {
      this.board[top] = [];
    }
  }

  public getSnakeLength(): number {
    return this.snakeLength;
  }


  public restartBoard(): void {
    for (let top = 0; top < this.config.boardSize; top++) {
      for (let left = 0; left < this.config.boardSize; left++) {
        this.board[top][left] = -1;
      }
    }

    this.headTop = random(this.config.boardSize);
    this.headLeft = random(this.config.boardSize);
    this.board[this.headTop][this.headLeft] = 0;
    this.generateObstacles();
    this.generateFruit();
    this.snakeLength = 1;
  }

  public move(action: Action): MoveResult {

    const previousDistance = this.fruitHeadDistance();

    let newHeadTop = this.headTop;
    let newHeadLeft = this.headLeft;

    switch (action) {
      case 'up':
        newHeadTop = newHeadTop - 1;
        break;
      case 'right':
        newHeadLeft = newHeadLeft + 1;
        break;
      case 'down':
        newHeadTop = newHeadTop + 1;
        break;
      case 'left':
        newHeadLeft = newHeadLeft - 1;
        break;
    }

    this.headLeft = newHeadLeft;
    this.headTop = newHeadTop;

    const isSnakeDead = this.isOnObstacle(this.headTop, this.headLeft);
    if (isSnakeDead) {
      return failedResult(this.config.snakeDeadReward);
    }
    else if (this.fruitTop === newHeadTop && this.fruitLeft == newHeadLeft) {
      this.eatFruit();
      return successfulResult(this.config.fruitEatenReward);
    }
    else {
      this.moveSnake();
      const newDistance = this.fruitHeadDistance();
      const reward = newDistance > previousDistance ? this.config.moveAgainstFruitDirectionReward : this.config.moveFruitDirectionReward;
      return successfulResult(reward);
    }
  }

  public copyTo(board: number[][]) {
    copyArray(this.board, board);
  }

  public getStateSize(): number {
    const kernel = (this.config.snakeVisibility * 2 + 1);
    return kernel * kernel - 1 + 2;//-1 for head and two extra places for fruit direction
  };

  public getState(): State {
    const result = [];
    for (let i = -this.config.snakeVisibility; i <= this.config.snakeVisibility; i++) {
      for (let j = -this.config.snakeVisibility; j <= this.config.snakeVisibility; j++) {
        if (i === 0 && j === 0) {
          //head
          continue;
        }
        const top = this.headTop + i;
        const left = this.headLeft + j;
        const obstacle = this.isOnObstacle(top, left) ? 1 : 0;
        result.push(obstacle);
      }
    }

    const fruitHeadPositionTop = (this.headTop - this.fruitTop) / Math.abs(this.headTop - this.fruitTop) || 0;
    const fruitHeadPositionLeft = (this.headLeft - this.fruitLeft) / Math.abs(this.headLeft - this.fruitLeft) || 0;

    result.push(fruitHeadPositionTop);
    result.push(fruitHeadPositionLeft);

    return result as State;
  }

  private isOnSnakeBody(top: number, left: number): boolean {
    const result = this.board[top][left] >= 0;
    return result;
  }

  private isOnObstacle(top: number, left: number): boolean {
    const result = top < 0
      || left < 0
      || top > this.config.boardSize - 1
      || left > this.config.boardSize - 1
      || this.board[top][left] === -3
      || this.isOnSnakeBody(top, left);
    return result;
  }

  private generateFruit(): void {
    do {
      this.fruitTop = random(this.config.boardSize);
      this.fruitLeft = random(this.config.boardSize);
    } while (this.isOnObstacle(this.fruitTop, this.fruitLeft));

    this.board[this.fruitTop][this.fruitLeft] = -2;
  }

  private generateObstacles(): void {
    for (let i = 0; i < this.config.randomObstacles; i++) {
      let top;
      let left;
      do {
        top = random(this.config.boardSize);
        left = random(this.config.boardSize);
      } while (this.isOnObstacle(top, left));

      this.board[top][left] = -3;
    }
  }

  private moveSnake(): void {
    for (let top = 0; top < this.config.boardSize; top++) {
      for (let left = 0; left < this.config.boardSize; left++) {
        if (!this.isOnSnakeBody(top, left)) {
          continue;
        }
        else if (this.board[top][left] === this.snakeLength - 1) {
          this.board[top][left] = -1;
        }
        else {
          this.board[top][left] = this.board[top][left] + 1;
        }
      }
    }
    this.board[this.headTop][this.headLeft] = 0;
  }

  private eatFruit(): void {
    //iterate and increase value of body and set fruit position new head
    for (let top = 0; top < this.config.boardSize; top++) {
      for (let left = 0; left < this.config.boardSize; left++) {
        if (this.isOnSnakeBody(top, left)) {
          this.board[top][left] = this.board[top][left] + 1;
        }
      }
    }

    this.snakeLength = this.snakeLength + 1;
    this.board[this.headTop][this.headLeft] = 0;
    this.generateFruit();
  }

  private fruitHeadDistance(): number {
    const dt = Math.abs(this.headTop - this.fruitTop);
    const dl = Math.abs(this.headLeft - this.fruitLeft);

    return dt + dl;
  }
}
