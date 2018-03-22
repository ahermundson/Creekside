import React, { Component } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import DatePicker from 'material-ui/DatePicker';
import RaisedButton from 'material-ui/RaisedButton';
import Snackbar from 'material-ui/Snackbar';
import { Tabs, Tab } from 'material-ui/Tabs';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import Dialog from 'material-ui/Dialog';
import TimePicker from 'material-ui/TimePicker';
import * as moment from 'moment';
import Delete from 'material-ui/svg-icons/action/delete';
import Edit from 'material-ui/svg-icons/content/create';
import { CSVLink } from 'react-csv';

// const serverAddress =
//   'http://helloworld-hermundson.us-east-2.elasticbeanstalk.com';
const serverAddress = '/api';

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
      newUser: {},
      openDialog: false,
      employeeEditDate: null
    };
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
    this.handleEmployeeEditDateChange = this.handleEmployeeEditDateChange.bind(
      this
    );
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
    this.openDialog = this.openDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.handlePunchedInTimeChange = this.handlePunchedInTimeChange.bind(this);
    this.handlePunchedOutTimeChange = this.handlePunchedOutTimeChange.bind(
      this
    );
    this.updateTimeClock = this.updateTimeClock.bind(this);
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
          this.setState(
            {
              punched_in: moment(response.data[0].punched_in).toDate(),
              punched_out: moment(response.data[0].punched_in).toDate(),
              timeClockID: response.data[0]._id
            },
            () => console.log(this.state)
          );
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
      .then(() => this.closeDialog());
  }

  closeDialog() {
    this.setState({ openDialog: false });
  }

  render() {
    const csvHeaders = [
      { label: 'Name', key: 'employee' },
      { label: 'Hours', key: 'hours' },
      { label: 'Minutes', key: 'minutes' }
    ];

    const actions = [
      <FlatButton label="Close" primary onClick={this.closeDialog} />,
      <FlatButton label="Save" primary onClick={this.updateTimeClock} />
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
          <h1 style={{ marginLeft: '15px' }}>Creekside</h1>
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
          <Tab label="Add User">
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
          <Tab label="Manage Users">
            <div
              style={{
                marginTop: '10px'
              }}>
              <Table
                onCellClick={(row, column) => {
                  switch (column) {
                    case 0:
                      console.log('Edit');
                      break;
                    case 3:
                      console.log('Delete');
                      break;
                    default:
                      this.openDialog(row);
                  }
                }}
                style={{ width: '80%', margin: '0 auto' }}>
                <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                  <TableRow>
                    <TableHeaderColumn style={{ width: '50px' }} />
                    <TableHeaderColumn>Name</TableHeaderColumn>
                    <TableHeaderColumn>Email</TableHeaderColumn>
                    <TableHeaderColumn style={{ width: '50px' }} />
                  </TableRow>
                </TableHeader>
                <TableBody
                  deselectOnClickaway={false}
                  displayRowCheckbox={false}>
                  {this.state.users.map(user => (
                    <TableRow key={user._id}>
                      <TableRowColumn style={{ width: '50px' }}>
                        <Edit />
                      </TableRowColumn>
                      <TableRowColumn>{`${user.first_name} ${
                        user.last_name
                      }`}</TableRowColumn>
                      <TableRowColumn>{user.email}</TableRowColumn>
                      <TableRowColumn style={{ width: '50px' }}>
                        <Delete />
                      </TableRowColumn>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {this.state.selectedUser && (
              <Dialog
                title={`Edit Time Clock for ${
                  this.state.selectedUser.first_name
                } ${this.state.selectedUser.last_name}`}
                actions={actions}
                modal
                open={this.state.openDialog}>
                <DatePicker
                  hintText="Select Date to Edit"
                  inputStyle={{ color: 'black' }}
                  hintStyle={{ color: 'black' }}
                  value={this.state.employeeEditDate}
                  onChange={this.handleEmployeeEditDateChange}
                />
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <TimePicker
                    format="ampm"
                    hintText="Punched In"
                    defaultTime={this.state.punched_in}
                    value={this.state.punched_in}
                    onChange={this.handlePunchedInTimeChange}
                  />
                  <TimePicker
                    format="ampm"
                    hintText="Punched Out"
                    defaultTime={this.state.punched_out}
                    value={this.state.punched_out}
                    onChange={this.handlePunchedOutTimeChange}
                  />
                </div>
              </Dialog>
            )}
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default Admin;
