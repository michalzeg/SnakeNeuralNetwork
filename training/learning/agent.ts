import { Config } from "./config";
import { Action, ActionReward, actions, getActionFromIndex } from "./actions";
import * as tf from '@tensorflow/tfjs'
import { State } from "./state";
import { Progress, createModel, predict, train } from "./network";

export class Agent {

    private readonly model: tf.Sequential;

    constructor(private readonly config: Config, stateSize: number){
        this.model = createModel(config.networkConfig, stateSize);
    }


    getAction(state: State, episode: number): Action{
        let actionIndex: number;
        const rnd = Math.random();
      
        //epsilon is changed through learnign so that there is higher probability to use q-table instead of random action
        //const normalizedEpisilon = config.epsilon + (iteration / config.episodes)*(1 - config.epsilon);
      
        //random policy in only through half episodes
        const normalizedEpisilon = episode < this.config.episodes / 2 ? this.config.epsilon : 1;
      
      
        if (rnd < normalizedEpisilon) {
          
          const values = predict(this.model, state);
      
          const max = Math.max(...values);
          actionIndex = values.indexOf(max);
      
        } else {
          actionIndex = Math.floor(Math.random() * actions.length); // 4 represents the number of possible actions (up, right, down, left)
        }
        const result = getActionFromIndex(actionIndex);
        return result;
    }

    predictReward(state: State): ActionReward{
      return predict(this.model, state);
    }

    async train(state: State, rewards: ActionReward, progress: Progress){
      return await train(this.model, state, rewards, progress);
    }

}