import { Config } from "./config";
import { Action, ActionReward, actions, getActionFromIndex, getActionIndex } from "./actions";
import * as tf from '@tensorflow/tfjs'
import { State } from "./state";
import { createModel, predict, train } from "./network";
import { ReplayBuffer } from './replay-buffer';
import { TrainBuffer } from "./train-buffer";

export class Agent {

  private readonly targetModel: tf.Sequential;
  private readonly sourceModel: tf.Sequential;

  constructor(private readonly config: Config, stateSize: number) {
    this.targetModel = createModel(config.networkConfig, stateSize);
    this.sourceModel = createModel(config.networkConfig, stateSize);
  }


  async getAction(state: State, episode: number): Promise<Action> {
    let actionIndex: number;
    const rnd = Math.random();

    //random policy in only through half episodes
    const normalizedEpisilon = episode < this.config.episodes / 2 ? this.config.epsilon : 1;

    if (rnd < normalizedEpisilon) {

      const values = await predict(this.sourceModel, state);

      const max = Math.max(...values);
      actionIndex = values.indexOf(max);

    } else {
      actionIndex = Math.floor(Math.random() * actions.length); // 4 represents the number of possible actions (up, right, down, left)
    }
    const result = getActionFromIndex(actionIndex);
    return result;
  }

  async predictReward(state: State): Promise<ActionReward> {
    const result = await predict(this.sourceModel, state);
    return result;
  }

  async train(buffer: ReplayBuffer[]): Promise<void> {

    const trainBuffer: Array<TrainBuffer> = [];

    for (const step of buffer) {
      const qValues = await this.predictReward(step.nextState);
      const maxQValue = Math.max(...qValues);
      const factor = step.done ? 0 : 1;
      const targetQValue = step.reward + (this.config.discountFactor * maxQValue) * factor;

      //Update the Q-value for the previous state and action pair
      const targetVector = await this.predictReward(step.state);
      const actionIndex = getActionIndex(step.action);

      targetVector[actionIndex] = targetQValue;
      trainBuffer.push({ state: step.state, targetVector });
    }

    await train(this.targetModel, trainBuffer);

    this.sourceModel.setWeights(this.targetModel.getWeights());
  }

}