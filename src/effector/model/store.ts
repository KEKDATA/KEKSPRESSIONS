import { createStore } from 'effector';
import * as tf from '@tensorflow/tfjs';
import { ModelsList } from '../../types';

export const $model = createStore<tf.LayersModel | null>(null);
export const $modelsList = createStore<ModelsList>({});
