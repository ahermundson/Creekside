import React from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import PropTypes from 'prop-types';

const styles = {
  main: {
    width: '50%',
    marginTop: '1em'
  },
  button: {
    height: '65px',
    backgroundColor: '#630012',
    labelColor: 'white',
    fontSize: '.7em'
  },
  buttonLabel: {
    color: 'white',
    fontSize: '1.75em'
  }
};

const LoginScreen = props => {
  if (!props.showUpdatePassword) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <span>{props.loginErrorMessage}</span>
        <TextField
          inputStyle={{ color: 'white' }}
          hintText="Username"
          onChange={props.handleUsernameChange}
          value={props.username}
        />
        <TextField
          inputStyle={{ color: 'white' }}
          hintText="Password"
          type="password"
          onChange={props.handlePasswordChange}
          value={props.password}
        />
        <RaisedButton
          label="Login"
          style={styles.main}
          buttonStyle={styles.button}
          labelStyle={styles.buttonLabel}
          onClick={props.onLoginClick}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <span>{props.updatePasswordError}</span>
      <span style={{ color: 'white', fontFamily: 'Roboto, sans-serif' }}>
        Please fill in the following fields to finish creating your account.
      </span>
      <TextField
        hintText="First Name"
        inputStyle={{ color: 'white' }}
        onChange={props.handleFirstNameChange}
        value={props.newEmployeeFirstName}
      />
      <TextField
        hintText="Last Name"
        inputStyle={{ color: 'white' }}
        onChange={props.handleLastNameChange}
        value={props.newEmployeeLastName}
      />
      <TextField
        hintText="New Password"
        inputStyle={{ color: 'white' }}
        type="password"
        onChange={props.handleNewPasswordChange}
        value={props.newPassword}
      />
      <RaisedButton
        label="Submit"
        style={styles.main}
        buttonStyle={styles.button}
        labelStyle={styles.buttonLabel}
        onClick={props.onUpdatePasswordClick}
      />
    </div>
  );
};

export default LoginScreen;

LoginScreen.propTypes = {
  loginErrorMessage: PropTypes.string,
  handleUsernameChange: PropTypes.func.isRequired,
  handlePasswordChange: PropTypes.func.isRequired,
  handleFirstNameChange: PropTypes.func.isRequired,
  handleLastNameChange: PropTypes.func.isRequired,
  handleNewPasswordChange: PropTypes.func.isRequired,
  onUpdatePasswordClick: PropTypes.func.isRequired,
  onLoginClick: PropTypes.func.isRequired,
  username: PropTypes.string,
  password: PropTypes.string,
  newPassword: PropTypes.string,
  newEmployeeLastName: PropTypes.string,
  newEmployeeFirstName: PropTypes.string,
  showUpdatePassword: PropTypes.bool.isRequired,
  updatePasswordError: PropTypes.string
};

LoginScreen.defaultProps = {
  loginErrorMessage: '',
  username: '',
  password: '',
  newPassword: '',
  newEmployeeLastName: '',
  newEmployeeFirstName: '',
  updatePasswordError: ''
};
