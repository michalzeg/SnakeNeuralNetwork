import * as tf from '@tensorflow/tfjs'
import { ActionReward, actionsCount } from "./actions";
import { State } from "./state";
import { NetworkConfig } from './config';
import { ReplayBuffer } from './replay-buffer';
import { TrainBuffer } from './train-buffer';

interface NormalizationData {
  inputs: tf.Tensor<tf.Rank>;
  labels: tf.Tensor<tf.Rank>;
}

export function createModel(config: NetworkConfig, stateSize: number): tf.Sequential {

  const model = tf.sequential();

  model.add(tf.layers.dense({ inputShape: [stateSize], units: 20, activation: 'relu', useBias: true }));

  for (let i = 0; i < config.hidderLayers; i++) {
    model.add(tf.layers.dense({ units: config.hiddenLayerUnits, activation: config.hidderLayerActivation as any, useBias: true }))
  }
  model.add(tf.layers.dense({ units: actionsCount, activation: 'linear', useBias: false }));

  model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.meanSquaredError,
    metrics: ['mse']
  });
  model.summary();
  return model;
}

export async function train(model: tf.Sequential, buffer: TrainBuffer[]): Promise<void> {
  const tensors = convertToTensor(buffer);

  const epochs = 1;

  const result = await model.fit(tensors.inputs, tensors.labels,
    {
      batchSize: 32,
      epochs,
    }
  );
}

export async function predict(model: tf.Sequential, state: State): Promise<ActionReward> {
  const prediction = tf.tidy(() => {
    const input = convertStateToTensor(state);
    return model.predict(input) as tf.Tensor<tf.Rank>;

  });
  const values = await prediction.data();
  prediction.dispose();
  return [...values.values()] as ActionReward;
}

function convertToTensor(buffer: TrainBuffer[]): NormalizationData {

  return tf.tidy(() => {
    tf.util.shuffle(buffer);

    const state = buffer.map(e => e.state);
    const rewards = buffer.map(e => e.targetVector);


    const inputTensor = tf.tensor2d(state, [state.length, state[0].length]);
    const labelTensor = tf.tensor2d(rewards, [rewards.length, actionsCount]);

    return {
      inputs: inputTensor,
      labels: labelTensor,
    }
  });
}

function convertStateToTensor(state: State): tf.Tensor<tf.Rank> {
  const value = tf.tidy(() => {
    const xsNorm = tf.tensor1d(state);
    const input = xsNorm.reshape([1, state.length]);
    return input;
  });
  return value;
}
