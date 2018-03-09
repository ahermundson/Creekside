import React, { Component } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import DatePicker from 'material-ui/DatePicker';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
import { Tabs, Tab } from 'material-ui/Tabs';
import TextField from 'material-ui/TextField';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import * as moment from 'moment';
import { CSVLink } from 'react-csv';

// const serverAddress =
//   'http://helloworld-hermundson.us-east-2.elasticbeanstalk.com';
const serverAddress = '/api';

const LandingHeader = styled.div`
  height: 15%;
  background-color: #1b5e20;
  width: 100%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: Roboto, sans-serif;
  padding: 5px;

  @media (max-width: 700px) {
    height: 5%;
  }
`;

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: null,
      endDate: null,
      timeClockData: [],
      users: [],
      selectedRows: [],
      open: false,
      openNewUser: false,
      newUser: {}
    };
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
    this.onRunTimeClockReportClick = this.onRunTimeClockReportClick.bind(this);
    this.handleRowSelection = this.handleRowSelection.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
    this.handleNewUserEmailChange = this.handleNewUserEmailChange.bind(this);
    this.handleNewUserLastNameChange = this.handleNewUserLastNameChange.bind(
      this
    );
    this.handleNewUserFirstNameChange = this.handleNewUserFirstNameChange.bind(
      this
    );
    this.onNewUserSubmit = this.onNewUserSubmit.bind(this);
  }

  componentDidMount() {
    axios
      .get(`${serverAddress}/user`)
      .then(response => this.setState({ users: response.data }));
  }

  onRunTimeClockReportClick() {
    const accessToken = localStorage.getItem('id_token');
    this.setState(
      {
        timeClockData: []
      },
      () => {
        this.state.selectedRows.forEach(user => {
          axios
            .get(`${serverAddress}/allUserTimeClock`, {
              params: {
                startDate: this.state.startDate,
                endDate: this.state.endDate,
                userID: user._id
              },
              headers: { Authorization: `${accessToken}` }
            })
            .then(response => {
              const userTimeArray = [];
              response.data.forEach(timeClockInstance => {
                const duration = moment.duration(
                  moment(timeClockInstance.punched_out).diff(
                    moment(timeClockInstance.punched_in)
                  )
                );
                const minutes = parseInt(duration.asMinutes(), 10);
                userTimeArray.push(minutes);
              });
              const reducer = (accumulator, currentValue) =>
                accumulator + currentValue;
              this.setState({
                timeClockData: [
                  ...this.state.timeClockData,
                  {
                    employee: `${user.first_name} ${user.last_name}`,
                    hours: Math.floor(userTimeArray.reduce(reducer) / 60),
                    minutes: userTimeArray.reduce(reducer) % 60
                  }
                ]
              });
            })
            .catch(() => {
              this.setState({
                open: true
              });
            });
        });
      }
    );
  }

  onNewUserSubmit() {
    axios
      .post('/api/user', {
        newUser: this.state.newUser
      })
      .then(response =>
        this.setState({
          users: [...this.state.users, response.data],
          openNewUser: true,
          newUser: {
            email: '',
            first_name: '',
            last_name: ''
          }
        })
      );
  }

  handleRequestClose = () => {
    this.setState({
      open: false
    });
  };

  handleRequestCloseNewUser = () => {
    this.setState({
      openNewUser: false
    });
  };

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

  handleNewUserEmailChange(e) {
    this.setState({
      newUser: {
        ...this.state.newUser,
        email: e.target.value
      }
    });
  }

  handleNewUserLastNameChange(e) {
    this.setState({
      newUser: {
        ...this.state.newUser,
        last_name: e.target.value
      }
    });
  }

  handleNewUserFirstNameChange(e) {
    this.setState({
      newUser: {
        ...this.state.newUser,
        first_name: e.target.value
      }
    });
  }

  isSelected = id =>
    this.state.selectedRows.map(user => user._id).indexOf(id) !== -1;

  handleRowSelection(selectedRows) {
    const fullSelectedRowObjectArray = [];
    selectedRows.forEach(row =>
      fullSelectedRowObjectArray.push(this.state.users[row])
    );
    this.setState({
      selectedRows: fullSelectedRowObjectArray
    });
  }

  render() {
    const csvHeaders = [
      { label: 'Name', key: 'employee' },
      { label: 'Hours', key: 'hours' },
      { label: 'Minutes', key: 'minutes' }
    ];

    return (
      <div>
        <Snackbar
          open={this.state.open}
          message="Error retrieving timeclock report"
          autoHideDuration={4000}
          onRequestClose={this.handleRequestClose}
        />
        <Snackbar
          open={this.state.openNewUser}
          message="User successfully created."
          autoHideDuration={4000}
          onRequestClose={this.handleRequestCloseNewUser}
        />
        <LandingHeader>
          <h1 style={{ marginLeft: '15px' }}>Creekside Lawn & Landscape</h1>
          <Link to="/">
            <RaisedButton style={{ marginRight: '15px' }}>Home</RaisedButton>
          </Link>
        </LandingHeader>
        <Tabs>
          <Tab label="Time Clock Report">
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '150px'
              }}>
              <DatePicker
                hintText="Start Date"
                style={{ marginRight: '15px' }}
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
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
              <RaisedButton
                disabled={!this.state.startDate || !this.state.endDate}
                style={{ padding: '5px', width: '200px' }}
                onClick={this.onRunTimeClockReportClick}>
                Run TimeClock Report
              </RaisedButton>
              {this.state.timeClockData.length ? (
                <CSVLink
                  data={this.state.timeClockData}
                  headers={csvHeaders}
                  filename={`CreeksideTimesheet${moment(new Date()).format(
                    'MMM Do YY'
                  )}`}>
                  <RaisedButton
                    style={{
                      padding: '5px',
                      marginTop: '10px',
                      width: '200px'
                    }}>
                    Download CSV
                  </RaisedButton>
                </CSVLink>
              ) : null}
            </div>
            <div
              style={{
                marginTop: '10px'
              }}>
              <Table
                onRowSelection={this.handleRowSelection}
                multiSelectable
                style={{ width: '80%', margin: '0 auto' }}>
                <TableHeader>
                  <TableRow>
                    <TableHeaderColumn>Name</TableHeaderColumn>
                    <TableHeaderColumn>Email</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody deselectOnClickaway={false}>
                  {this.state.users.map(user => (
                    <TableRow
                      key={user._id}
                      selected={this.isSelected(user._id)}>
                      <TableRowColumn>{`${user.first_name} ${
                        user.last_name
                      }`}</TableRowColumn>
                      <TableRowColumn>{user.email}</TableRowColumn>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Tab>
          <Tab label="Manage Users">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '25px'
              }}>
              <TextField
                hintText="Enter New User Email"
                underlineFocusStyle={{ borderColor: '#1b5e20' }}
                inputStyle={{ color: 'white' }}
                hintStyle={{ color: 'white' }}
                onChange={this.handleNewUserEmailChange}
                value={this.state.newUser.email}
              />
              <TextField
                hintText="Enter New User First Name"
                underlineFocusStyle={{ borderColor: '#1b5e20' }}
                inputStyle={{ color: 'white' }}
                hintStyle={{ color: 'white' }}
                onChange={this.handleNewUserFirstNameChange}
                value={this.state.newUser.first_name}
              />
              <TextField
                hintText="Enter New User Last Name"
                underlineFocusStyle={{ borderColor: '#1b5e20' }}
                inputStyle={{ color: 'white' }}
                hintStyle={{ color: 'white' }}
                onChange={this.handleNewUserLastNameChange}
                value={this.state.newUser.last_name}
              />
              <RaisedButton
                style={{ marginLeft: '10px' }}
                onClick={this.onNewUserSubmit}>
                Submit
              </RaisedButton>
            </div>
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default Admin;
