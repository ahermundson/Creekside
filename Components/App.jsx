import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../redux/store';
import Landing from './Landing';
import Admin from './Admin';
import Header from './Header';

const App = () => (
  <Provider store={store}>
    <div style={{ height: '100vh' }}>
      <Header />
      <Switch>
        <Route exact path="/" component={Landing} />
        <Route path="/admin" component={Admin} />
      </Switch>
    </div>
  </Provider>
);

export default App;
