import React, { useEffect, useRef, useState } from 'react';
import { Tabs, Tab, Box } from '@material-ui/core';
import * as tfvis from '@tensorflow/tfjs-vis';
import * as tf from '@tensorflow/tfjs';
import { loadData } from '../../utils/load-data';
// @ts-ignore
import trainData from '../../../data/train.csv';
import { Unwrap } from '../../utils/unwrap';
import { buildModel, compileModel } from '../../utils/build-model';

const modelURL = 'localstorage://kekspressions';

type TabPanelProps = {
  index: number;
  currentIndex: number;
  children: React.ReactNode;
  className?: string;
};
function TabPanel({ index, currentIndex, children, className }: TabPanelProps) {
  return (
    // @ts-ignore
    <Box className={className} pt={3} style={{ display: index !== currentIndex && 'none' }}>
      {children}
    </Box>
  );
}

export function Train() {
  const summaryContainerRef = useRef<HTMLDivElement>(null!);
  const trainInfoContainerRef = useRef<HTMLDivElement>(null!);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    let model: tf.LayersModel;
    let data: Unwrap<ReturnType<typeof loadData>>;

    async function train(useLastModel = false, epochs = 5, batchSize = 64) {
      [model, data] = await Promise.all([
        useLastModel ? tf.loadLayersModel(modelURL) : buildModel(),
        loadData(trainData),
      ]);

      if (useLastModel) {
        compileModel(model);
      }

      await tfvis.show.modelSummary(summaryContainerRef.current, model);

      await model.fitDataset(data.batch(batchSize), {
        epochs,
        callbacks: await tfvis.show.fitCallbacks(trainInfoContainerRef.current, ['loss', 'acc'], {
          width: trainInfoContainerRef.current.clientWidth - 20,
        }),
      });
      await model.save(modelURL);
      await model.save('downloads://kekspressions');
      model.dispose();
    }

    train(true);

    return () => {
      model.dispose();
    };
  }, []);

  return (
    // @ts-ignore
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab value={0} label="Графики" />
        <Tab value={1} label="Информация о модели" />
      </Tabs>
      <TabPanel index={0} currentIndex={tab}>
        <div ref={trainInfoContainerRef} />
      </TabPanel>
      <TabPanel index={1} currentIndex={tab}>
        <div ref={summaryContainerRef} />
      </TabPanel>
    </Box>
  );
}
