import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import styled from 'styled-components';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import DatePicker from 'material-ui/DatePicker';
import { Tabs, Tab } from 'material-ui/Tabs';
import AccessTime from 'material-ui/svg-icons/device/access-time';
import Money from 'material-ui/svg-icons/editor/attach-money';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import * as moment from 'moment';
import axios from 'axios';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  getUserInfo,
  punchIn,
  punchOut,
  startJob,
  finishJob
} from './redux/actionCreators';
import Auth from './Auth/Auth';

const jwt = require('jsonwebtoken');
// import Lock from './Auth/Lock';

// const serverAddress =
//   'http://helloworld-hermundson.us-east-2.elasticbeanstalk.com';
const serverAddress = '/api';

const TableWrapper = styled.div`
  width: 80%;
  margin: 0 auto;

  @media (max-width: 700px) {
    width: 100%;
  }
`;

const LandingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 15% auto;
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

const LandingHeader = styled.div`
  height: 15%;
  background-color: #630012;
  width: 100%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: Roboto, sans-serif;

  @media (max-width: 700px) {
    height: 10%;
  }
`;

const DatePickerDiv = styled.div`
  display: flex,
  justify-content: center,
  margin-top: 150px;

  @media (max-width: 700px) {
    flex-direction: column;
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
    fontSize: '2em'
  },
  floatingLabelStyle: {
    color: 'white'
  },
  selectStyle: {
    width: '50%'
  }
};

const auth = new Auth();
// const auth = new Lock();

class Landing extends Component {
  static login() {
    auth.login();
  }

  constructor(props) {
    super(props);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
    this.onPunchInClick = this.onPunchInClick.bind(this);
    this.onPunchOutClick = this.onPunchOutClick.bind(this);
    this.setSession = this.setSession.bind(this);
    this.handleLocationChange = this.handleLocationChange.bind(this);
    this.onStartJobClick = this.onStartJobClick.bind(this);
    this.onFinishJobClick = this.onFinishJobClick.bind(this);
    this.getEmployeeHourData = this.getEmployeeHourData.bind(this);
    this.state = {
      selectedLocation: null,
      startDate: null,
      endDate: new Date(),
      employeeHoursData: null
    };
    if (window.location.hash.includes('#access_token')) {
      auth.auth0.parseHash(
        { hash: window.location.hash },
        (err, authResult) => {
          // TODO handle auth error

          if (authResult) {
            this.setSession(authResult);
            return auth.auth0.client.userInfo(
              authResult.accessToken,
              (error, user) => {
                this.props.getUserInfo(user.email);
              }
            );
          }
          return null;
        }
      );
    }
  }

  componentDidMount() {
    const accessToken = localStorage.getItem('id_token');

    if (accessToken) {
      jwt.verify(
        accessToken,
        Buffer.from(process.env.AUTH_SECRET),
        { algorithms: ['HS256'] },
        (err, decoded) => {
          if (!err) {
            this.props.getUserInfo(decoded.email);
          }
        }
      );
    }
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

  onPunchInClick() {
    this.props.punchIn(
      this.props.userInfo._id,
      new Date(),
      this.state.selectedLocation
    );
  }

  onPunchOutClick() {
    this.props.punchOut(this.props.userInfo._id);
  }

  onStartJobClick() {
    this.props.startJob(
      this.props.userInfo._id,
      new Date(),
      this.state.selectedLocation
    );
    this.setState({
      selectedLocation: null
    });
  }

  onFinishJobClick() {
    this.props.finishJob(this.props.userInfo._id);
  }

  setSession(authResult) {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  getEmployeeHourData() {
    axios
      .get(`${serverAddress}/employeeHours`, {
        params: {
          user_id: this.props.userInfo._id,
          startDate: this.state.startDate,
          endDate: this.state.endDate
        }
      })
      .then(response => this.setState({ employeeHoursData: response.data }));
  }

  handleStartDateChange(e, date) {
    this.setState({
      startDate: date
    });
  }

  handleEndDateChange(e, date) {
    this.setState({
      endDate: date
    });
  }

  handleLocationChange(event, index, value) {
    this.setState({
      selectedLocation: value
    });
  }

  calculateHours(punchedIn, punchedOut) {
    const duration = moment.duration(
      moment(punchedOut).diff(moment(punchedIn))
    );
    return (parseInt(duration.asMinutes(), 10) / 60).toFixed(2);
  }

  render() {
    return (
      <div style={{ height: '80vh' }}>
        <LandingHeader>
          <h2
            style={{
              marginLeft: '15px',
              padding: '3px 5px 3px 5px',
              border: '1px solid white'
            }}>
            C
          </h2>
          {this.props.userInfo.isAdmin ? (
            <Link to="/admin">
              <RaisedButton style={{ marginRight: '15px' }}>Admin</RaisedButton>
            </Link>
          ) : null}
        </LandingHeader>
        <Tabs
          tabItemContainerStyle={{
            height: '100%'
          }}
          contentContainerStyle={{
            height: '100%'
          }}>
          <Tab icon={<AccessTime />}>
            <LandingContainer>
              {!this.props.userInfo.isAuthenticated ? (
                <RaisedButton
                  label="Login"
                  style={styles.main}
                  buttonStyle={styles.button}
                  labelStyle={styles.buttonLabel}
                  onClick={Landing.login}
                />
              ) : null}
              {!this.props.activeTimeClock &&
              this.props.userInfo.isAuthenticated ? (
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                  <h3
                    style={{
                      color: 'white',
                      fontFamily: 'Roboto, sans-serif'
                    }}>
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
              ) : null}
              {this.props.activeTimeClock &&
              this.props.userInfo.isAuthenticated ? (
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                  <h3
                    style={{
                      color: 'white',
                      fontFamily: 'Roboto, sans-serif'
                    }}>{`Welcome ${this.props.userInfo.first_name} ${
                    this.props.userInfo.last_name
                  }`}</h3>
                  <SelectField
                    disabled={this.props.activeJob}
                    labelStyle={{ color: 'white' }}
                    selectedMenuItemStyle={{ color: 'tan' }}
                    value={this.state.selectedLocation}
                    floatingLabelText="Select Job Location"
                    floatingLabelStyle={{ color: 'white' }}
                    onChange={this.handleLocationChange}>
                    {this.state.locationMenuItems}
                  </SelectField>
                  {!this.props.activeJob ? (
                    <RaisedButton
                      label="Start Job"
                      style={styles.main}
                      buttonStyle={styles.button}
                      labelStyle={styles.buttonLabel}
                      onClick={this.onStartJobClick}
                    />
                  ) : (
                    <RaisedButton
                      label="Finish Job"
                      style={styles.main}
                      buttonStyle={styles.button}
                      labelStyle={styles.buttonLabel}
                      onClick={this.onFinishJobClick}
                    />
                  )}
                  <RaisedButton
                    label="Punch Out"
                    style={styles.main}
                    buttonStyle={styles.button}
                    labelStyle={styles.buttonLabel}
                    onClick={this.onPunchOutClick}
                  />
                </div>
              ) : null}
            </LandingContainer>
          </Tab>
          <Tab icon={<Money />}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                marginBottom: '25px'
              }}>
              <DatePickerDiv>
                <DatePicker
                  hintText="Start Date"
                  style={{ marginRight: '15px', marginTop: '15px' }}
                  inputStyle={{ color: 'white' }}
                  hintStyle={{ color: 'white' }}
                  value={this.state.startDate}
                  onChange={this.handleStartDateChange}
                />
                <DatePicker
                  hintText="End Date"
                  inputStyle={{ color: 'white' }}
                  hintStyle={{ color: 'white' }}
                  value={this.state.endDate}
                  onChange={this.handleEndDateChange}
                />
              </DatePickerDiv>
              <RaisedButton
                style={{ marginBottom: '20px' }}
                label="Get Hours"
                onClick={this.getEmployeeHourData}
              />
              {this.state.employeeHoursData ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                  <span
                    style={{
                      textAlign: 'center',
                      marginTop: '20px',
                      marginBottom: '20px',
                      color: 'white',
                      fontFamily: 'Roboto, sans-serif'
                    }}>
                    Total:{' '}
                  </span>
                  <TableWrapper>
                    <Table>
                      <TableHeader
                        adjustForCheckbox={false}
                        displaySelectAll={false}>
                        <TableRow>
                          <TableHeaderColumn>Date</TableHeaderColumn>
                          <TableHeaderColumn>Punch In Time</TableHeaderColumn>
                          <TableHeaderColumn>Punch Out Time</TableHeaderColumn>
                          <TableHeaderColumn>Hours</TableHeaderColumn>
                        </TableRow>
                      </TableHeader>
                      <TableBody displayRowCheckbox={false}>
                        {this.state.employeeHoursData.map(hours => (
                          <TableRow key={hours._id}>
                            <TableRowColumn>
                              {moment(hours.punched_in).format('MM-DD-YYYY')}
                            </TableRowColumn>
                            <TableRowColumn>
                              {moment(hours.punched_in).format('hh:mm A')}
                            </TableRowColumn>
                            <TableRowColumn>
                              {moment(hours.punched_out).format('hh:mm A')}
                            </TableRowColumn>
                            <TableRowColumn>
                              {this.calculateHours(
                                hours.punched_in,
                                hours.punched_out
                              )}
                            </TableRowColumn>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableWrapper>
                </div>
              ) : null}
            </div>
          </Tab>
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  userInfo: state.userInfo,
  activeTimeClock: !isEmpty(
    state.timeClock.find(timeClock => timeClock.activeTimeClock)
  ),
  activeJob: !isEmpty(state.jobClock.find(jobClock => jobClock.activeJob))
});

const mapDispatchToProps = dispatch => ({
  getUserInfo(email) {
    dispatch(getUserInfo(email));
  },
  punchIn(userId, time, location) {
    dispatch(punchIn(userId, time, location));
  },
  punchOut(userId) {
    dispatch(punchOut(userId));
  },
  startJob(userId, time, location) {
    dispatch(startJob(userId, time, location));
  },
  finishJob(userId) {
    dispatch(finishJob(userId));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Landing);

Landing.propTypes = {
  getUserInfo: PropTypes.func.isRequired,
  punchIn: PropTypes.func.isRequired,
  punchOut: PropTypes.func.isRequired,
  startJob: PropTypes.func.isRequired,
  finishJob: PropTypes.func.isRequired,
  userInfo: PropTypes.shape({
    _id: PropTypes.string,
    email: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    isAdmin: PropTypes.bool,
    isAuthenticated: PropTypes.bool
  }),
  activeTimeClock: PropTypes.bool,
  activeJob: PropTypes.bool
};

Landing.defaultProps = {
  userInfo: {},
  activeTimeClock: false,
  activeJob: false
};
