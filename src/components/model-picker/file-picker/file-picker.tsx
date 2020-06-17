import React, { useCallback, useRef, useState } from 'react';
import { Button, Grid } from '@material-ui/core';
import * as R from 'ramda';
import * as tfjs from '@tensorflow/tfjs';
import { FileInput } from '../../file-input';
import { loadModelFx } from '../../../effector/model';

const fileLens = R.lensPath(['files', 0]);
const getFile = R.view<HTMLInputElement, File>(fileLens);
const getFileName = R.pipe<HTMLInputElement, ReturnType<typeof getFile>, string>(
  getFile,
  R.prop('name'),
);

export function FilePicker() {
  const modelInputRef = useRef<HTMLInputElement>(null!);
  const weightsInputRef = useRef<HTMLInputElement>(null!);
  const [modelFileName, setModelFileName] = useState('');
  const [weightsFileName, setWeightsFileName] = useState('');

  const save = useCallback(() => {
    const files = [getFile(modelInputRef.current), getFile(weightsInputRef.current)];
    loadModelFx({ path: tfjs.io.browserFiles(files) }).then(() => console.log('loaded'));
  }, []);

  return (
    <form>
      <Grid container direction="column" spacing={3}>
        <Grid item container spacing={3}>
          <Grid item>
            {/*
          // @ts-ignore */}
            <FileInput
              ref={modelInputRef}
              color="primary"
              id="model"
              onChange={e => {
                setModelFileName(getFileName(e.target));
              }}
            >
              Модель
            </FileInput>
            {modelFileName}
          </Grid>
          <Grid item>
            {/*
          // @ts-ignore */}
            <FileInput
              ref={weightsInputRef}
              color="primary"
              id="weights"
              onChange={e => {
                setWeightsFileName(getFileName(e.target));
              }}
            >
              Веса
            </FileInput>
            {weightsFileName}
          </Grid>
        </Grid>
        <Grid item>
          <Button onClick={save}>Подтвердить</Button>
        </Grid>
      </Grid>
    </form>
  );
}
