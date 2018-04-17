import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import styled from 'styled-components';
import RaisedButton from 'material-ui/RaisedButton';
import MenuItem from 'material-ui/MenuItem';
import { Tabs, Tab } from 'material-ui/Tabs';
import AccessTime from 'material-ui/svg-icons/device/access-time';
import Money from 'material-ui/svg-icons/editor/attach-money';
import axios from 'axios';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Auth } from 'aws-amplify';
import { RotatingPlane } from 'better-react-spinkit';
import { getUserInfo, punchIn, toggleLoader } from '../redux/actionCreators';

import TimeClock from './TimeClock';
import LoginScreen from './LoginScreen';
import SingleEmployeeTimeClockReport from './SingleEmployeeTimeClockReport';

const serverAddress =
  process.env.NODE_ENV === 'dev'
    ? '/api'
    : 'http://helloworld-hermundson.us-east-2.elasticbeanstalk.com';

const LandingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 5% auto;
  height: 100%;
  background-color: rgba(128, 128, 128, 0.8);
  border: 5px solid white;
  padding: 15px;
  width: 80%;
  @media (max-width: 700px) {
    width: 85%;
    margin-top: 10%;
  }
`;

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
  },
  floatingLabelStyle: {
    color: 'white'
  },
  selectStyle: {
    width: '50%'
  }
};

class Landing extends Component {
  state = {
    selectedLocation: null,
    startDate: null,
    endDate: new Date(),
    employeeHoursData: null,
    username: '',
    password: '',
    newPassword: '',
    loginErrorMessage: null,
    showUpdatePassword: false,
    cognitoUser: null,
    reqAttributes: null,
    newEmployeeLastName: '',
    newEmployeeFirstName: ''
  };

  componentDidMount() {
    Auth.currentSession()
      .then(session => {
        this.props.getUserInfo(session.accessToken.payload.username);
        this.props.toggleLoader();
      })
      .catch(() => this.props.toggleLoader());

    axios.get(`${serverAddress}/location`).then(response => {
      const locationMenuItems = response.data.map(location => (
        <MenuItem
          key={location._id}
          value={location._id}
          primaryText={`${location.type} - ${location.propertyName}`}
        />
      ));

      this.setState({
        locationMenuItems
      });
    });
  }

  onPunchInClick = () => {
    this.props.toggleLoader();
    this.props.punchIn(
      this.props.userInfo._id,
      new Date(),
      this.state.selectedLocation
    );
  };

  onLoginClick = () => {
    this.props.toggleLoader();
    const { username, password } = this.state;
    Auth.signIn(username, password)
      .then(user => {
        if (
          user.challengeName &&
          user.challengeName === 'NEW_PASSWORD_REQUIRED'
        ) {
          this.props.toggleLoader();
          this.setState({
            showUpdatePassword: true,
            cognitoUser: user,
            reqAttributes: user.challengeParam.requiredAttributes
          });
        } else {
          this.props.getUserInfo(username);
        }
      })
      .catch(err => this.setState({ loginErrorMessage: err.message }));
  };

  onUpdatePasswordClick = () => {
    const { cognitoUser, newPassword, reqAttributes } = this.state;
    Auth.completeNewPassword(cognitoUser, newPassword, reqAttributes)
      .then(user => {
        this.props.getUserInfo(this.state.username);
        axios
          .post(
            `${serverAddress}/user`,
            {
              first_name: this.state.newEmployeeFirstName,
              last_name: this.state.newEmployeeLastName,
              username: this.state.username
            },
            {
              headers: {
                Authorization: `${user.signInUserSession.accessToken.jwtToken}`
              }
            }
          )
          .then(() => this.props.getUserInfo(this.state.username));
      })
      .catch(err => this.setState({ updatePasswordError: err.message }));
  };

  getEmployeeHourData = () => {
    axios
      .get(`${serverAddress}/employeeHours`, {
        params: {
          user_id: this.props.userInfo._id,
          startDate: this.state.startDate,
          endDate: this.state.endDate
        }
      })
      .then(response => this.setState({ employeeHoursData: response.data }));
  };

  handleStartDateChange = (e, date) => {
    this.setState({
      startDate: date
    });
  };

  handleEndDateChange = (e, date) => {
    this.setState({
      endDate: date
    });
  };

  handleFirstNameChange = event => {
    this.setState({
      newEmployeeFirstName: event.target.value
    });
  };

  handleLastNameChange = event => {
    this.setState({
      newEmployeeLastName: event.target.value
    });
  };

  handleLocationChange = (event, index, value) => {
    this.setState({
      selectedLocation: value
    });
  };

  handleUsernameChange = event => {
    this.setState({
      username: event.target.value
    });
  };

  handlePasswordChange = event => {
    this.setState({
      password: event.target.value
    });
  };

  handleNewPasswordChange = event => {
    this.setState({
      newPassword: event.target.value
    });
  };

  render() {
    return (
      <div style={{ height: '80vh' }}>
        {this.props.isLoading ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <RotatingPlane size={100} color="white" />
          </div>
        ) : (
          <Tabs
            tabItemContainerStyle={{
              height: '100%'
            }}
            contentContainerStyle={{
              height: '100%'
            }}
          >
            <Tab icon={<AccessTime />}>
              <LandingContainer>
                {!this.props.userInfo.isAuthenticated && (
                  <LoginScreen
                    loginErrorMessage={this.state.loginErrorMessage}
                    handleUsernameChange={this.handleUsernameChange}
                    handlePasswordChange={this.handlePasswordChange}
                    handleFirstNameChange={this.handleFirstNameChange}
                    handleLastNameChange={this.handleLastNameChange}
                    newEmployeeLastName={this.state.newEmployeeLastName}
                    newEmployeeFirstName={this.state.newEmployeeFirstName}
                    onLoginClick={this.onLoginClick}
                    username={this.state.username}
                    password={this.state.password}
                    newPassword={this.state.newPassword}
                    showUpdatePassword={this.state.showUpdatePassword}
                    handleNewPasswordChange={this.handleNewPasswordChange}
                    onUpdatePasswordClick={this.onUpdatePasswordClick}
                    updatePasswordError={this.state.updatePasswordError}
                  />
                )}
                {!this.props.activeTimeClock &&
                  this.props.userInfo.isAuthenticated && (
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <h3
                        style={{
                          color: 'white',
                          fontFamily: 'Roboto, sans-serif'
                        }}
                      >
                        {`Welcome ${this.props.userInfo.first_name} ${
                          this.props.userInfo.last_name
                        }`}
                      </h3>
                      <RaisedButton
                        label="Punch In"
                        style={styles.main}
                        buttonStyle={styles.button}
                        labelStyle={styles.buttonLabel}
                        onClick={this.onPunchInClick}
                      />
                    </div>
                  )}
                {this.props.activeTimeClock &&
                  this.props.userInfo.isAuthenticated && (
                    <TimeClock
                      locationMenuItems={this.state.locationMenuItems}
                      handleLocationChange={this.handleLocationChange}
                      selectedLocation={this.state.selectedLocation}
                    />
                  )}
              </LandingContainer>
            </Tab>
            <Tab icon={<Money />}>
              <SingleEmployeeTimeClockReport
                startDate={this.state.startDate}
                endDate={this.state.endDate}
                handleStartDateChange={this.handleStartDateChange}
                handleEndDateChange={this.handleEndDateChange}
                getEmployeeHourData={this.getEmployeeHourData}
                employeeHoursData={this.state.employeeHoursData}
              />
            </Tab>
          </Tabs>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  userInfo: state.userInfo,
  activeTimeClock: !isEmpty(
    state.timeClock.find(timeClock => timeClock.activeTimeClock)
  ),
  activeJob: !isEmpty(state.jobClock.find(jobClock => jobClock.activeJob)),
  isLoading: state.isLoading
});

const mapDispatchToProps = dispatch => ({
  getUserInfo(username) {
    dispatch(getUserInfo(username));
  },
  punchIn(userId, time, location) {
    dispatch(punchIn(userId, time, location));
  },
  toggleLoader() {
    dispatch(toggleLoader());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Landing);

Landing.propTypes = {
  getUserInfo: PropTypes.func.isRequired,
  punchIn: PropTypes.func.isRequired,
  userInfo: PropTypes.shape({
    _id: PropTypes.string,
    email: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    isAdmin: PropTypes.bool,
    isAuthenticated: PropTypes.bool
  }),
  activeTimeClock: PropTypes.bool,
  isLoading: PropTypes.bool.isRequired,
  toggleLoader: PropTypes.func.isRequired
};

Landing.defaultProps = {
  userInfo: {},
  activeTimeClock: false
};
