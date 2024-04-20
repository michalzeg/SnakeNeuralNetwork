import { Progress } from "./learning/progress";
import { getActionIndex } from "./learning/actions";
import { Config } from "./learning/config";
import { Environment } from "./learning/environment";
import { initalizeBoardArray } from "./utils/utils";
import { Agent } from "./learning/agent";

export const startTraining = async (config: Config, modelName: string, progress: Progress): Promise<boolean> => {

  const environment = new Environment(config.environmentConfig);
  const boardTableProgress = initalizeBoardArray(config.environmentConfig.boardSize);
  const stateSize = environment.getStateSize();
  const agent = new Agent(config, stateSize);

  for (let episode = 0; episode < config.episodes; episode++) {

    environment.restartBoard()

 
    // Continue taking actions (i.e., moving) until we reach a terminal state
    let isFailed = false;
    let actionCount = 0;
    while (!isFailed) {
      actionCount++;
      const maxActions = getMaxIteration(config.maxActionsPerIteration, environment.getSnakeLength());
      if (actionCount > maxActions) {
        actionCount = 0;
        break;
      }

      environment.copyTo(boardTableProgress);
      progress({ board: boardTableProgress, snakeLength: environment.getSnakeLength(), episode, actionCount });

      // Choose which action to take (i.e., where to move next)
      const currentState = environment.getState();
      const action = agent.getAction(currentState, episode);
      const actionIndex = getActionIndex(action);
      
      // Perform the chosen action, and transition to the next state (i.e., move to the next location)
      const moveResult = environment.move(action);
      isFailed = moveResult.isFailed;
      // Receive the reward for moving to the new state and calculate the temporal difference
     

      const newState = environment.getState();

      const target = agent.predictReward(newState);
      const maxQValue = Math.max(...target);
      const value = moveResult.reward + (config.discountFactor * maxQValue);

      // Update the Q-value for the previous state and action pair
      const targetVector = agent.predictReward(currentState);
      targetVector[actionIndex] = value;
      await agent.train(currentState, targetVector, () => { });
    }
  }

  return true;
};

const getMaxIteration = (maxActions: number, snakeLength: number): number => maxActions * snakeLength;

