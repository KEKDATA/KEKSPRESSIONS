import * as tf from '@tensorflow/tfjs';
import { Unwrap } from './utils/unwrap';

export type WebcamIterator = Unwrap<ReturnType<typeof tf.data.webcam>>;

export type ModelsList = Unwrap<ReturnType<typeof tf.io.listModels>>;
