import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'material-ui/DatePicker';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import styled from 'styled-components';
import * as moment from 'moment';

const TableWrapper = styled.div`
  width: 80%;
  margin: 0 auto;

  @media (max-width: 700px) {
    width: 100%;
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

const calculateHours = (punchedIn, punchedOut) => {
  const duration = moment.duration(moment(punchedOut).diff(moment(punchedIn)));
  return (parseInt(duration.asMinutes(), 10) / 60).toFixed(2);
};

const SingleEmployeeTimeClockReport = props => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      marginBottom: '25px'
    }}
  >
    <DatePickerDiv>
      <DatePicker
        hintText="Start Date"
        style={{ marginRight: '15px', marginTop: '15px' }}
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
    </DatePickerDiv>
    <RaisedButton
      style={{ marginBottom: '20px' }}
      label="Get Hours"
      onClick={props.getEmployeeHourData}
    />
    {props.employeeHoursData && (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <span
          style={{
            textAlign: 'center',
            marginTop: '20px',
            marginBottom: '20px',
            color: 'white',
            fontFamily: 'Roboto, sans-serif'
          }}
        >
          Total:{' '}
        </span>
        <TableWrapper>
          <Table>
            <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
              <TableRow>
                <TableHeaderColumn>Date</TableHeaderColumn>
                <TableHeaderColumn>Punch In Time</TableHeaderColumn>
                <TableHeaderColumn>Punch Out Time</TableHeaderColumn>
                <TableHeaderColumn>Hours</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {props.employeeHoursData.map(hours => (
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
                    {calculateHours(hours.punched_in, hours.punched_out)}
                  </TableRowColumn>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrapper>
      </div>
    )}
  </div>
);

export default SingleEmployeeTimeClockReport;

SingleEmployeeTimeClockReport.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  handleStartDateChange: PropTypes.func.isRequired,
  handleEndDateChange: PropTypes.func.isRequired,
  getEmployeeHourData: PropTypes.func.isRequired,
  employeeHoursData: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      punchedIn: PropTypes.instanceOf(Date),
      user_id: PropTypes.string,
      activeTimeClock: PropTypes.bool,
      location_id: PropTypes.string,
      punched_out: PropTypes.instanceOf(Date)
    })
  )
};

SingleEmployeeTimeClockReport.defaultProps = {
  startDate: null,
  endDate: null,
  employeeHoursData: null
};
