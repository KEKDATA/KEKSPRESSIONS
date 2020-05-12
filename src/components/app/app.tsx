import React from 'react';
import { MuiThemeProvider, CssBaseline } from '@material-ui/core';
import { hot } from 'react-hot-loader/root';
import { theme } from '../../ui/theme';

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
    </MuiThemeProvider>
  );
}

export const AppHot = hot(App);
