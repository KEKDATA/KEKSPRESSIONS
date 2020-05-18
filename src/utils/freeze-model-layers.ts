import * as tf from '@tensorflow/tfjs';

export function freezeModelLayers(trainableLayers: string[], model: tf.LayersModel) {
  model.layers.forEach(layer => {
    if (!trainableLayers.includes(layer.name)) {
      // eslint-disable-next-line no-param-reassign
      layer.trainable = false;
    }
  });
  return model;
}
