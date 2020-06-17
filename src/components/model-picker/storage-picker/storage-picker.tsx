import { useStore } from 'effector-react';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { $modelsList } from '../../../effector/model/store';
import { loadModelFx, loadModelsListFx } from '../../../effector/model';

export function StoragePicker() {
  const models = useStore($modelsList);
  const [selected, setSelected] = useState<string>();

  const loadModel = () => loadModelFx({ path: selected! });

  useEffect(() => {
    loadModelsListFx();
  }, []);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Название</TableCell>
                <TableCell>Дата сохранения</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(models).map(([path, info]) => (
                <TableRow key={path} onClick={() => setSelected(path)}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={selected === path} />
                  </TableCell>
                  <TableCell>{path}</TableCell>
                  <TableCell>{new Date(info.dateSaved).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item>
        <Button onClick={loadModel}>Подтвердить</Button>
      </Grid>
    </Grid>
  );
}
