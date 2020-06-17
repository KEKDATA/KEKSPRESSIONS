import React, { useEffect, useRef, useState } from 'react';
import { Button, Grid } from '@material-ui/core';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { Tensor, InferenceSession } from 'onnxjs';
import { WebcamIterator } from '../../types';
import { Emotion } from '../emotion';
import modelURL from './fer.onnx';
import { EmotionProps } from '../emotion/emotion';

const labelMap = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral'] as const;
const session = new InferenceSession({ backendHint: 'cpu' });

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

function getImage(img: tf.Tensor3D, face: blazeface.NormalizedFace) {
  return tf.tidy(() => {
    const { topLeft, bottomRight } = face as {
      topLeft: tf.Tensor1D;
      bottomRight: tf.Tensor1D;
    };
    const [height, width] = img.shape;
    const pad = 30;
    const bbox = tf
      .concat([
        topLeft
          .sub(tf.tensor1d([pad, pad * 2]))
          .reverse()
          .div([height, width]), // [x, y] => [y, x] => [y / height, x / width]
        bottomRight.add(tf.scalar(pad)).reverse().div([height, width]),
      ])
      .expandDims() as tf.Tensor2D;

    const boxInd = [0];
    const cropSize: [number, number] = [224, 224];
    // const normalized = img.div(tf.scalar(127.5)).sub(tf.scalar(1)).mean(2) as tf.Tensor4D;
    const normalized = img.div(tf.scalar(255)).mean(2) as tf.Tensor4D;
    const croppedImage = tf.image.cropAndResize(
      tf.stack([normalized, normalized, normalized], 2).expandDims(),
      bbox,
      boxInd,
      cropSize,
    );
    return [croppedImage.transpose([0, 3, 1, 2])];
  });
}

export function ExpressionRecognizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const webcamRef = useRef<WebcamIterator>(null!);
  const [running, setRunning] = useState(false);
  const [emotion, setEmotion] = useState<EmotionProps['type']>();

  useEffect(() => {
    async function run() {
      if (!webcamRef.current) {
        webcamRef.current = await tf.data.webcam(undefined, {
          resizeWidth: 700,
          resizeHeight: 700,
        });
      } else {
        await webcamRef.current.start();
      }
      await session.loadModel(modelURL);
      const [faceNet] = await Promise.all([blazeface.load({ maxFaces: 1 })]);
      // eslint-disable-next-line no-restricted-syntax
      for await (const img of imgStream(webcamRef.current)) {
        const [face] = await faceNet.estimateFaces(img, true);

        if (!face) {
          await tf.nextFrame();
          // eslint-disable-next-line no-continue
          continue;
        }

        // get prediction
        const [im] = getImage(img, face);
        //

        //
        const d = await im.data();
        const t = new Tensor(d, 'float32', im.shape);
        const ass = (await session.run([t])).get('pyotar_ass')?.data as Float32Array;
        const label = await tf.tensor1d(ass).argMax().data();

        console.log(labelMap[label]);

        // webcamRef.current.stop();
        //

        // draw image
        // await tf.browser.toPixels(im.squeeze().transpose([1, 2, 0]), canvasRef.current);
        await tf.browser.toPixels(img, canvasRef.current);
        //

        setEmotion(labelMap[label]);

        // cleanup
        im.dispose();
        img.dispose();
        //

        await tf.nextFrame();
      }
    }
    if (running) {
      run();
    } else if (!running && webcamRef.current) {
      webcamRef.current.stop();
    }
  }, [running]);

  useEffect(
    () => () => {
      // eslint-disable-next-line no-unused-expressions
      webcamRef.current?.stop();
    },
    [],
  );

  return (
    <Grid container alignItems="center" direction="column" spacing={2}>
      <Grid item container justify="center" spacing={2} wrap="nowrap">
        <Grid item>
          <canvas style={{ width: 500, height: 400 }} ref={canvasRef} />
        </Grid>
        <Grid container item style={{ width: 350 }} direction="column">
          {emotion && <Emotion type={emotion} conf={1} />}
        </Grid>
      </Grid>
      <Grid item>
        <Button onClick={() => setRunning(x => !x)}>{running ? 'Стоп' : 'Старт'}</Button>
      </Grid>
    </Grid>
  );
}
