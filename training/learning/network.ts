import * as tf from '@tensorflow/tfjs'
import { ActionReward, actionsCount } from "./actions";
import { State } from "./state";
import { NetworkConfig } from './config';

//export const activationIdentifiers = ['elu', 'hardSigmoid', 'linear', 'relu', 'relu6', 'selu', 'sigmoid', 'softmax', 'softplus', 'softsign', 'tanh', 'swish', 'mish'];

export type Progress = (value: string) => void;

export interface NormalizationData {
  inputs: tf.Tensor<tf.Rank>;
  labels: tf.Tensor<tf.Rank>;
  // Return the min/max bounds so we can use them later.
}

export function createModel(config: NetworkConfig, stateSize: number): tf.Sequential {

  const model = tf.sequential();

  model.add(tf.layers.dense({ inputShape: [stateSize], units: 20, activation: 'relu', useBias: true }));

  for (let i = 0; i < config.hidderLayers; i++) {
    model.add(tf.layers.dense({ units: config.hiddenLayerUnits, activation: config.hidderLayerActivation as any, useBias: true }))
  }
  model.add(tf.layers.dense({ units: actionsCount,activation:'linear', useBias: false }));

  model.compile({
    optimizer: tf.train.adam(),
    loss: tf.losses.meanSquaredError,
    metrics: ['mse']
  });
  model.summary();
  return model;
}

export async function train(model: tf.Sequential, state: State, rewards: ActionReward, progress: Progress): Promise<void> {
  const tensors = convertToTensor(state,rewards);

  const epochs = 1;

  const result = await model.fit(tensors.inputs, tensors.labels,
    {
      //batchSize,
      epochs,
      //callbacks: {
        //onBatchEnd: (batch: number, logs: any) => progress(`batch: ${batch} acc: ${logs.acc}`)
      //}
    }
  );
}

export function predict(model: tf.Sequential, state: State): ActionReward {
  const result = tf.tidy(() => {
    const input = convertStateToTensor(state);
    const prediction = model.predict(input) as tf.Tensor<tf.Rank>;
    const values = prediction.dataSync();
    return values;
  });
  return [...result.values()] as ActionReward;
}

export function convertToTensor(state: State, rewards: ActionReward): NormalizationData {

  return tf.tidy(() => {

    const inputTensor = tf.tensor2d(state, [1, state.length]);
    const labelTensor = tf.tensor2d(rewards, [1, actionsCount]);

    return {
      inputs: inputTensor,
      labels: labelTensor,
    }
  });
}

export function convertStateToTensor(state: State): tf.Tensor<tf.Rank> {
  const value = tf.tidy(() => {
    const xsNorm = tf.tensor1d(state);
    const input = xsNorm.reshape([1, state.length]);
    return input;
  });
  return value;
}
