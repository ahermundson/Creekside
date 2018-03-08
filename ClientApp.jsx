import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import App from './App';

const muiTheme = getMuiTheme({
  datePicker: {
    headerColor: '#1b5e20',
    selectColor: '#1b5e20',
    color: '#1b5e20'
  },
  flatButton: {
    primaryTextColor: '#1b5e20'
  },
  checkbox: {
    checkedColor: '#1b5e20'
  },
  tabs: {
    backgroundColor: '#4C5B61',
    textColor: '#172815',
    selectedTextColor: 'white'
  },
  inkBar: {
    backgroundColor: '#C5C5C5'
  }
});

const renderApp = () => {
  render(
    <MuiThemeProvider muiTheme={muiTheme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MuiThemeProvider>,
    document.getElementById('app')
  );
};

renderApp();

if (module.hot) {
  module.hot.accept('./App', () => {
    renderApp();
  });
}
