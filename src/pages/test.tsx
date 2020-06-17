import React, { useEffect, useRef } from 'react';
import { useStore } from 'effector-react';
import * as tf from '@tensorflow/tfjs';
import { Grid, Typography } from '@material-ui/core';
import { $model } from '../effector/model/store';
import { loadData } from '../utils/load-data';
// @ts-ignore
import dataPath from '../../data/fer2013.csv';
import { compileModel } from '../utils/build-model';

export function Test() {
  const model = useStore($model);
  const c1 = useRef<HTMLCanvasElement>(null!);
  const c2 = useRef<HTMLCanvasElement>(null!);

  useEffect(() => {
    async function test() {
      if (model || true) {
        console.log('testiiiiiiing');
        const data = await loadData(dataPath);
        const skip = 2;
        const fear = data
          .filter(x => {
            const [r] = x.ys.squeeze().argMax().equal(2).dataSync();
            return r;
          })
          .skip(skip)
          .take(1);
        const surprise = data
          .filter(x => {
            const [r] = x.ys.squeeze().argMax().equal(5).dataSync();
            return r;
          })
          .skip(skip)
          .take(1);
        await fear.forEachAsync(x => {
          tf.browser.toPixels(x.xs.squeeze(), c1.current);
          x.ys.print();
        });
        await surprise.forEachAsync(x => {
          tf.browser.toPixels(x.xs.squeeze(), c2.current);
          x.ys.print();
        });
      }
    }

    test();
  }, []);

  return (
    <Grid container>
      <Grid item>
        <canvas ref={c1} />
        <Typography>Страх</Typography>
      </Grid>
      <Grid item>
        <canvas ref={c2} />
        <Typography>Удивление</Typography>
      </Grid>
    </Grid>
  );
}
