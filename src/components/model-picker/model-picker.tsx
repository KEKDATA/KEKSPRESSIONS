import React, { useState } from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { TabPanel } from '../tab-panel';
import { StoragePicker } from './storage-picker';
import { FilePicker } from './file-picker';

export function ModelPicker() {
  const [tab, setTab] = useState(0);

  return (
    <>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab value={0} label="localstorage/indexeddb" />
        <Tab value={1} label="Файл" />
      </Tabs>
      <TabPanel index={0} currentIndex={tab}>
        <StoragePicker />
      </TabPanel>
      <TabPanel index={1} currentIndex={tab}>
        <FilePicker />
      </TabPanel>
    </>
  );
}
