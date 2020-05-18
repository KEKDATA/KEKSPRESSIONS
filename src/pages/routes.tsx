import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Train } from '../components/train';
import { Layout } from '../components/layout';

export function Routes() {
  return (
    <Switch>
      <Route path="/" exact>
        <Layout>Hello</Layout>
      </Route>
      <Route path="/train">
        <Layout>
          <Train />
        </Layout>
      </Route>
    </Switch>
  );
}
