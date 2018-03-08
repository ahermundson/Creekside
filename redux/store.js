import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducers';

const store = createStore(
  reducer,
  compose(
    applyMiddleware(thunk),
    // establish devtool middleware
    typeof window === 'object' && // We are in the browser
    typeof window.devToolsExtension !== 'undefined' // and can find the devtools extension
      ? window.devToolsExtension() // run devtools
      : f => f // else do a function that does nothing
  )
);

export default store;
