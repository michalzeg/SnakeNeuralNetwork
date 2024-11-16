import { Progress } from "./src/progress";
import { getActionIndex } from "./src/actions";
import { Config } from "./src/config";
import { Environment } from "./src/environment";
import { initalizeBoardArray, wait } from "./utils/utils";
import { Agent } from "./src/agent";
import { ReplayBuffer } from './src/replay-buffer';


export const startTraining = async (config: Config, modelName: string, progress: Progress): Promise<boolean> => {

  const environment = new Environment(config.environmentConfig);
  const boardTableProgress = initalizeBoardArray(config.environmentConfig.boardSize);
  const stateSize = environment.getStateSize();
  const agent = new Agent(config, stateSize);
  let replayBuffer: ReplayBuffer[] = [];

  for (let episode = 0; episode < config.episodes; episode++) {

    environment.restartBoard()


    // Continue taking actions (i.e., moving) until we reach a terminal state

    let done = false;
    let actionCount = 0;
    while (!done) {
      actionCount++;


      environment.copyTo(boardTableProgress);
      progress({ board: boardTableProgress, snakeLength: environment.getSnakeLength(), episode, actionCount });

      // Choose which action to take (i.e., where to move next)
      const state = environment.getState();
      const action = await agent.getAction(state, episode);

      // Perform the chosen action, and transition to the next state (i.e., move to the next location)
      const moveResult = environment.move(action);
      done = moveResult.isFailed;

      // Receive the reward for moving to the new state and calculate the temporal difference
      const nextState = environment.getState();
      const reward = moveResult.reward;


      const maxActions = getMaxIteration(config.maxActionsPerIteration, environment.getSnakeLength());


      if (actionCount < maxActions) {
        replayBuffer.push({ state, nextState, done, action, reward });
      } else {
        actionCount = 0;
        done = true;
        replayBuffer.push({ state, nextState, done, action, reward: config.environmentConfig.snakeDeadReward })
      }
    }


    if (replayBuffer.length > config.minReplayBufferCapacity) {
      await agent.train(replayBuffer);
      replayBuffer = [];
    }
  }

  return true;
};

const getMaxIteration = (maxActions: number, snakeLength: number, factor = 3): number => maxActions * snakeLength * factor;

