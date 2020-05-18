/* eslint-disable no-await-in-loop */
import React, { useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { Grid } from '@material-ui/core';
import { Unwrap } from '../../utils/unwrap';

type WebcamIterator = Unwrap<ReturnType<typeof tf.data.webcam>>;
type Net = Unwrap<ReturnType<typeof blazeface.load>>;

export function FaceTracker() {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const webcamRef = useRef<HTMLVideoElement>(null!);
  const webcam = useRef<WebcamIterator>();
  const net = useRef<Net>();
  const unmountRef = useRef(false);

  useEffect(() => {
    async function run() {
      if (!net.current) {
        net.current = await blazeface.load();
      }
      if (!webcam.current) {
        webcam.current = await tf.data.webcam(webcamRef.current);
      } else {
        webcam.current.start();
      }
      const ctx = canvasRef.current.getContext('2d');

      while (!unmountRef.current) {
        const img = await webcam.current.capture();
        await tf.browser.toPixels(img, canvasRef.current);
        const predictions = await net.current.estimateFaces(img);
        predictions.forEach(prediction => {
          const { topLeft, bottomRight } = prediction;
          const [tx, ty] = topLeft as [number, number];
          const [bx, by] = bottomRight as [number, number];
          const width = bx - tx;
          const height = by - ty;
          ctx!.strokeRect(tx, ty, width, height);
        });

        img.dispose();

        await tf.nextFrame();
      }
      webcam.current.stop();
    }

    run();
  }, []);

  useEffect(
    () => () => {
      unmountRef.current = true;
    },
    [],
  );

  return (
    <Grid container justify="center" alignItems="center">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video style={{ display: 'none' }} ref={webcamRef} />
      <Grid item>
        <canvas ref={canvasRef} />
      </Grid>
    </Grid>
  );
}
