import * as tf from '@tensorflow/tfjs';
import { freezeModelLayers } from './freeze-model-layers';

const modelURL = 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json';
const trainableLayers = [
  'denseModified',
  'conv_pw_13_bn',
  'conv_pw_13',
  'conv_dw_13_bn',
  'conv _dw_13',
];
const metrics = ['accuracy'];
const loss = 'categoricalCrossentropy';
const optimizer = tf.train.adam(1e-3);

export function compileModel(model: tf.LayersModel) {
  model.compile({
    loss,
    optimizer,
    metrics,
  });
}

export async function buildModel(name = 'KEKMODEL') {
  const model = await tf.loadLayersModel(modelURL);

  const x = model.getLayer('global_average_pooling2d_1');

  const predictions = tf.layers
    .dense({ units: 7, activation: 'softmax', name: 'denseModified' })
    .apply(x.output) as tf.SymbolicTensor;

  let modifiedModel = tf.model({
    inputs: model.input,
    outputs: predictions,
    name,
  });

  modifiedModel = freezeModelLayers(trainableLayers, modifiedModel);

  compileModel(modifiedModel);

  return modifiedModel;
}
