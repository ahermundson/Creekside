import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Landing from './Landing';
import Admin from './Admin';

const App = () => (
  <Provider store={store}>
    <Switch>
      <Route exact path="/" component={Landing} />
      <Route path="/admin" component={Admin} />
    </Switch>
  </Provider>
);

export default App;
