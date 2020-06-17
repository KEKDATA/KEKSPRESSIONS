import React, { useEffect, useRef, useState } from 'react';
import * as R from 'ramda';
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import * as blazeface from '@tensorflow-models/blazeface';
import trainData from '../../../data/train.csv';
import { IMAGENET_CLASSES } from './imagenet-classes';
import { WebcamIterator } from '../../types';

const metrics = ['accuracy'];
const modelPath = 'localstorage://kekspressions';
const labelMap = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral'] as const;

async function train(useLastModel = false) {
  const [data, model] = await Promise.all([
    loadData(trainData),
    useLastModel ? tf.loadLayersModel('localstorage://kekspressions') : getModifiedMobilenet(),
  ]);
  if (useLastModel) {
    model.compile({
      loss: 'categoricalCrossentropy',
      optimizer: tf.train.adam(1e-3),
      metrics,
    });
  }
  const surface = { name: 'Model Summary', tab: 'Model Inspection' };
  await tfvis.show.modelSummary(surface, model);
}

async function test() {
  const model = await tf.loadLayersModel('localstorage://kekspressions');
  model.compile({
    loss: 'categoricalCrossentropy',
    optimizer: tf.train.adam(1e-3),
    metrics: ['accuracy'],
  });
  await tfvis.show.modelSummary({ tab: 'test', name: '' }, model);
  const data = await loadData(trainData);
  const evaluationRes = (await model.evaluateDataset(
    data.skip(2048).take(7).batch(1),
  )) as tf.Tensor[];
  evaluationRes.forEach(t => t.print());
  model.dispose();
}

async function reshape(canvasRef, imageRef) {
  const mobilenet = await tf.loadLayersModel(
    'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json',
  );
  // await mobilenet.save('localstorage://mobilenet');
  // const mobilenet = tf.loadLayersModel('localstorage://mobilenet');
  const other = mobilenet.getLayer(undefined, 1).output;
  const input = tf.layers.inputLayer({ inputShape: [128, 128, 3] });
  // input.apply(other);
  const model = tf.sequential();
  model.add(input);
  mobilenet.layers.forEach((l, i) => {
    if (i !== 0) {
      model.add(l);
    }
  });
  // mobilenet.layers.forEach((l, i) => {
  //   model.layers[i].setWeights(l.getWeights());
  // });

  const d = await tf.browser.fromPixels(imageRef.current);
  const resized = tf.image.resizeBilinear(d.div(tf.fill(d.shape, [255])), [128, 128]);
  await tf.browser.toPixels(resized, canvasRef.current);
  console.log(d);
  d.print();

  const r = (await model.predict(resized.expandDims())) as tf.Tensor2D;
  const [rd] = await r.squeeze().argMax().data();
  console.log(IMAGENET_CLASSES[rd]);
  console.log('reshape done');
}

async function* imgStream(webcam: WebcamIterator) {
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const img = await webcam.capture();
    if (!img) {
      return;
    }
    yield img;
  }
}

export function NetInfo() {
  // const videoRef = useRef<HTMLVideoElement>(null!);
  // const canvasRef = useRef<HTMLCanvasElement>(null!);
  // const [emotion, setEmotion] = useState<typeof labelMap[number] | null>(null);
  // useEffect(() => {
  //   async function run() {
  //     const [model, faceNet, webcam] = await Promise.all([
  //       tf.loadLayersModel(modelPath),
  //       blazeface.load({ maxFaces: 1 }),
  //       tf.data.webcam(videoRef.current),
  //     ]);
  //     // eslint-disable-next-line no-restricted-syntax
  //     for await (const img of imgStream(webcam)) {
  //       const [face] = await faceNet.estimateFaces(img, true);
  //
  //       // get prediction
  //       const prediction = tf.tidy(() => {
  //         const { topLeft, bottomRight } = face as {
  //           topLeft: tf.Tensor1D;
  //           bottomRight: tf.Tensor1D;
  //         };
  //         const [height, width] = img.shape;
  //         const bbox = tf
  //           .concat([
  //             topLeft.reverse().div([height, width]), // [x, y] => [y, x] => [y / height, x / width]
  //             bottomRight.reverse().div([height, width]),
  //           ])
  //           .expandDims() as tf.Tensor2D;
  //
  //         const boxInd = [0];
  //         const cropSize: [number, number] = [224, 224];
  //         const normalized = img.div(tf.fill(img.shape, 255)).expandDims() as tf.Tensor4D;
  //         const croppedImage = tf.image.cropAndResize(normalized, bbox, boxInd, cropSize);
  //         return model.predict(croppedImage) as tf.Tensor2D;
  //       });
  //       //
  //
  //       // draw image
  //       await tf.browser.toPixels(img, canvasRef.current);
  //       //
  //
  //       // extract predicted class label
  //       const [label] = await prediction.squeeze().argMax().data();
  //       //
  //       setEmotion(labelMap[label]);
  //
  //       // cleanup
  //       prediction.dispose();
  //       img.dispose();
  //       //
  //
  //       await tf.nextFrame();
  //     }
  //   }
  //   run();
  // }, []);

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video ref={videoRef} />
      <canvas ref={canvasRef} />
      <p>{emotion}</p>
    </>
  );
}
