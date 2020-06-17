import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Train } from '../components/train';
import { Layout } from '../components/layout';
import { ModelPicker } from '../components/model-picker';
import { ExpressionRecognizer } from '../components/expression-recognizer';
import { Test } from './test';

export function Routes() {
  return (
    <Switch>
      <Route path="/" exact>
        <Layout>
          <ModelPicker />
        </Layout>
      </Route>
      <Route path="/train">
        <Layout>
          <Train />
        </Layout>
      </Route>
      <Route path="/test">
        <Layout>
          <Test />
        </Layout>
      </Route>
      <Route path="/recognition">
        <Layout>
          <ExpressionRecognizer />
        </Layout>
      </Route>
      <Route path="*">
        <Layout>Not found</Layout>
      </Route>
    </Switch>
  );
}
