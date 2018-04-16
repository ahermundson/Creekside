import React from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import DatePicker from 'material-ui/DatePicker';
import RaisedButton from 'material-ui/RaisedButton';
import * as moment from 'moment';
import { CSVLink } from 'react-csv';
import PropTypes from 'prop-types';

const csvHeaders = [
  { label: 'Name', key: 'employee' },
  { label: 'Hours', key: 'hours' },
  { label: 'Minutes', key: 'minutes' }
];

const TimeClockReport = props => (
  <div>
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
        value={props.startDate}
        onChange={props.handleStartDateChange}
      />
      <DatePicker
        hintText="End Date"
        inputStyle={{ color: 'white' }}
        hintStyle={{ color: 'white' }}
        value={props.endDate}
        onChange={props.handleEndDateChange}
      />
    </div>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
      <RaisedButton
        disabled={!props.startDate || !props.endDate}
        style={{ padding: '5px', width: '200px' }}
        onClick={props.onRunTimeClockReportClick}>
        Run TimeClock Report
      </RaisedButton>
      {props.timeClockData.length ? (
        <CSVLink
          data={props.timeClockData}
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
        onRowSelection={props.handleRowSelection}
        multiSelectable
        style={{ width: '80%', margin: '0 auto' }}>
        <TableHeader>
          <TableRow>
            <TableHeaderColumn>Name</TableHeaderColumn>
            <TableHeaderColumn>Email</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody deselectOnClickaway={false}>
          {props.users.map(user => (
            <TableRow key={user._id} selected={props.isSelected(user._id)}>
              <TableRowColumn>{`${user.first_name} ${
                user.last_name
              }`}</TableRowColumn>
              <TableRowColumn>{user.email}</TableRowColumn>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

export default TimeClockReport;

TimeClockReport.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      email: PropTypes.string,
      first_name: PropTypes.string,
      last_name: PropTypes.string,
      isAdmin: PropTypes.bool
    })
  ).isRequired,
  handleRowSelection: PropTypes.func.isRequired,
  onRunTimeClockReportClick: PropTypes.func.isRequired,
  handleStartDateChange: PropTypes.func.isRequired,
  handleEndDateChange: PropTypes.func.isRequired,
  isSelected: PropTypes.func.isRequired,
  timeClockData: PropTypes.arrayOf(
    PropTypes.shape({
      employee: PropTypes.string,
      hours: PropTypes.number,
      minutes: PropTypes.number
    })
  ),
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date)
};

TimeClockReport.defaultProps = {
  timeClockData: [],
  startDate: null,
  endDate: null
};
