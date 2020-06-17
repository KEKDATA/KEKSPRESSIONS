import React, { useEffect, useRef, useState } from 'react';
import { Tabs, Tab, Box } from '@material-ui/core';
import * as tfvis from '@tensorflow/tfjs-vis';
import { useStore } from 'effector-react';
import { loadData } from '../../utils/load-data';
// @ts-ignore
import trainData from '../../../data/fer2013.csv';
import { Unwrap } from '../../utils/unwrap';
import { compileModel } from '../../utils/build-model';
import { $model } from '../../effector/model/store';

const modelURL = 'localstorage://kekspressions';
const indexeddb = 'indexeddb://';

type TabPanelProps = {
  index: number;
  currentIndex: number;
  children: React.ReactNode;
  className?: string;
};
function TabPanel({ index, currentIndex, children, className }: TabPanelProps) {
  return (
    // @ts-ignore
    <Box className={className} py={3} style={{ display: index !== currentIndex && 'none' }}>
      {children}
    </Box>
  );
}

export function Train() {
  const summaryContainerRef = useRef<HTMLDivElement>(null!);
  const trainInfoContainerRef = useRef<HTMLDivElement>(null!);
  const [tab, setTab] = useState(0);

  const net = useStore($model);

  useEffect(() => {
    tfvis.show.modelSummary(summaryContainerRef.current, net);
  }, [net]);

  useEffect(() => {
    let data: Unwrap<ReturnType<typeof loadData>>;

    async function train(useLastModel = false, epochs = 5, batchSize = 32) {
      [data] = await Promise.all([loadData(trainData)]);

      if (useLastModel) {
        console.log('compile');
        compileModel(net);
      }

      await tfvis.show.modelSummary(summaryContainerRef.current, net);

      const { onEpochEnd, onBatchEnd } = tfvis.show.fitCallbacks(
        trainInfoContainerRef.current,
        ['loss', 'acc'],
        {
          width: trainInfoContainerRef.current.clientWidth - 20,
        },
      );

      await net.fitDataset(data.take(32).batch(batchSize), {
        epochs,
        callbacks: {
          onBatchEnd,
          onEpochEnd: async (epoch, logs) => {
            await net!.save(`${indexeddb}${net!.name}_${epoch}`);
            await onEpochEnd(epoch, logs!);
          },
        },
      });
      await net.save(modelURL);
    }
    if (net) {
      // train(true);
    }
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
