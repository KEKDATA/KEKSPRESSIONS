import { createEffect } from 'effector';
import * as tf from '@tensorflow/tfjs';
import { ModelsList } from '../../types';

export const loadModelsListFx = createEffect<void, ModelsList>().use(tf.io.listModels);

type loadModelFxParams = {
  path: string | tf.io.IOHandler;
  options?: tf.io.LoadOptions;
};
export const loadModelFx = createEffect<
  loadModelFxParams,
  tf.LayersModel
>().use(({ path, options }) => tf.loadLayersModel(path, options));
