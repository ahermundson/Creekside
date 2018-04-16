import React from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

const AddUser = props => (
  <div
    style={{
      width: '50%',
      padding: '30px',
      backgroundColor: 'rgba(128, 128, 128, 0.8)',
      border: '5px solid white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '25px auto'
    }}>
    <TextField
      hintText="Enter New User Email"
      underlineFocusStyle={{ borderColor: '#1b5e20' }}
      inputStyle={{ color: 'white' }}
      hintStyle={{ color: 'white' }}
      onChange={props.handleNewUserEmailChange}
      value={props.newUser.email}
    />
    <TextField
      hintText="Enter New User First Name"
      underlineFocusStyle={{ borderColor: '#1b5e20' }}
      inputStyle={{ color: 'white' }}
      hintStyle={{ color: 'white' }}
      onChange={props.handleNewUserFirstNameChange}
      value={props.newUser.first_name}
    />
    <TextField
      hintText="Enter New User Last Name"
      underlineFocusStyle={{ borderColor: '#1b5e20' }}
      inputStyle={{ color: 'white' }}
      hintStyle={{ color: 'white' }}
      onChange={props.handleNewUserLastNameChange}
      value={props.newUser.last_name}
    />
    <RaisedButton
      style={{ marginLeft: '10px' }}
      onClick={props.onNewUserSubmit}>
      Submit
    </RaisedButton>
  </div>
);

export default AddUser;

AddUser.propTypes = {
  onNewUserSubmit: PropTypes.func.isRequired,
  handleNewUserLastNameChange: PropTypes.func.isRequired,
  handleNewUserFirstNameChange: PropTypes.func.isRequired,
  handleNewUserEmailChange: PropTypes.func.isRequired,
  newUser: PropTypes.shape({
    email: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string
  })
};

AddUser.defaultProps = {
  newUser: {}
};
