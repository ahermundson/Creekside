import React, { Component } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
import { Tabs, Tab } from 'material-ui/Tabs';

import * as moment from 'moment';

import TimeClockReport from './TimeClockReport';
import AddUser from './AddUser';
import ManageUsers from './ManageUsers';

const serverAddress =
  process.env.NODE_ENV === 'dev'
    ? '/api'
    : 'http://helloworld-hermundson.us-east-2.elasticbeanstalk.com';

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
    height: 5%;
  }
`;

class Admin extends Component {
  state = {
    startDate: null,
    endDate: null,
    timeClockData: [],
    users: [],
    selectedRows: [],
    open: false,
    openNewUser: false,
    openTimeClockChanged: false,
    newUser: {},
    openDialog: false,
    employeeEditDate: null
  };

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
      .post(`${serverAddress}/user`, {
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

  handleRequestCloseTimeClockChange = () => {
    this.setState({
      openTimeClockChanged: false
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

  handleEmployeeEditDateChange(e, date) {
    this.setState({
      employeeEditDate: date
    });
    axios
      .get(`${serverAddress}/singleTimeClock`, {
        params: {
          date: date.toString(),
          userId: this.state.selectedUser._id
        }
      })
      .then(response => {
        if (response.data.length) {
          this.setState({
            punched_in: moment(response.data[0].punched_in).toDate(),
            punched_out: moment(response.data[0].punched_out).toDate(),
            timeClockID: response.data[0]._id
          });
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

  handlePunchedInTimeChange(event, date) {
    this.setState({
      punched_in: date
    });
  }

  handlePunchedOutTimeChange(event, date) {
    this.setState({
      punched_out: date
    });
  }

  openDialog(row) {
    this.setState({ openDialog: true, selectedUser: this.state.users[row] });
  }

  updateTimeClock() {
    axios
      .put(`${serverAddress}/singleTimeClock`, {
        timeClockID: this.state.timeClockID,
        punched_in: this.state.punched_in,
        punched_out: this.state.punched_out
      })
      .then(() => {
        this.closeDialog();
        this.setState({
          openTimeClockChanged: true
        });
      });
  }

  closeDialog() {
    this.setState({
      openDialog: false,
      punched_in: null,
      punched_out: null,
      employeeEditDate: null
    });
  }

  render() {
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
        <Snackbar
          open={this.state.openTimeClockChanged}
          message="Timeclock successfully updated."
          autoHideDuration={4000}
          onRequestClose={this.handleRequestCloseTimeClockChange}
        />
        <LandingHeader>
          <h1 style={{ marginLeft: '15px' }}>Creekside</h1>
          <Link to="/">
            <RaisedButton style={{ marginRight: '15px' }}>Home</RaisedButton>
          </Link>
        </LandingHeader>
        <Tabs>
          <Tab label="Time Clock Report">
            <TimeClockReport
              users={this.state.users}
              handleRowSelection={this.handleRowSelection}
              onRunTimeClockReportClick={this.onRunTimeClockReportClick}
              handleStartDateChange={this.handleStartDateChange}
              handleEndDateChange={this.handleEndDateChange}
              timeClockData={this.state.timeClockData}
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              isSelected={this.isSelected}
            />
          </Tab>
          <Tab label="Add User">
            <AddUser
              onNewUserSubmit={this.onNewUserSubmit}
              handleNewUserLastNameChange={this.handleNewUserLastNameChange}
              handleNewUserFirstNameChange={this.handleNewUserFirstNameChange}
              handleNewUserEmailChange={this.handleNewUserEmailChange}
              newUser={this.state.newUser}
            />
          </Tab>
          <Tab label="Manage Users">
            <ManageUsers
              handlePunchedOutTimeChange={this.handlePunchedOutTimeChange}
              handlePunchedInTimeChange={this.handlePunchedInTimeChange}
              handleEmployeeEditDateChange={this.handleEmployeeEditDateChange}
              punchedOut={this.state.punched_out}
              punchedIn={this.state.punched_in}
              employeeEditDate={this.state.employeeEditDate}
              selectedUser={this.state.selectedUser}
              users={this.state.users}
              openDialog={this.openDialog}
              isDialogOpen={this.state.openDialog}
              closeDialog={this.closeDialog}
              updateTimeClock={this.updateTimeClock}
            />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default Admin;
