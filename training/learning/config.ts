
export interface NetworkConfig {
  hidderLayers: number;
  hiddenLayerUnits: number;
  hidderLayerActivation: string;
  inputLayerUnits: number;
}

export interface EnvironmentConfig {
  boardSize: number;
  randomObstacles: number;
  snakeVisibility: number;

  fruitEatenReward: number;
  snakeDeadReward: number;
  moveFruitDirectionReward: number;
  moveAgainstFruitDirectionReward: number;
}

export interface Config {
  epsilon: number;
  discountFactor: number;
  episodes: number;
  maxActionsPerIteration: number;
  networkConfig: NetworkConfig;
  environmentConfig: EnvironmentConfig;
}

export const defaultConfig: Config = {
  epsilon: 0.99,
  discountFactor: 0.9,
  episodes: 50000,
  maxActionsPerIteration: 100,
  networkConfig: {
    hidderLayers: 3,
    hiddenLayerUnits: 50,
    hidderLayerActivation: 'relu',
    inputLayerUnits: 20
  },
  environmentConfig: {
    boardSize: 30,
    randomObstacles: 50,
    snakeVisibility: 2,

    fruitEatenReward: 10,
    snakeDeadReward: -50,
    moveFruitDirectionReward: 1.1,
    moveAgainstFruitDirectionReward: -0.9,
  }
};
