import React from 'react';
import { MuiThemeProvider, CssBaseline } from '@material-ui/core';
import { hot } from 'react-hot-loader/root';
import { BrowserRouter as Router } from 'react-router-dom';
import { theme } from '../../ui/theme';
import { Routes } from '../../pages/routes';

export function App() {
  return (
    <Router>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Routes />
      </MuiThemeProvider>
    </Router>
  );
}

export const AppHot = hot(App);
