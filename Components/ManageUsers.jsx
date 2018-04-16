import React from 'react';
import PropTypes from 'prop-types';
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
import DatePicker from 'material-ui/DatePicker';

import FlatButton from 'material-ui/FlatButton';
import Delete from 'material-ui/svg-icons/action/delete';
import Edit from 'material-ui/svg-icons/content/create';

const ManageUsers = props => {
  const actions = [
    <FlatButton label="Close" primary onClick={props.closeDialog} />,
    <FlatButton label="Save" primary onClick={props.updateTimeClock} />
  ];

  return (
    <div>
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
                props.openDialog(row);
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
          <TableBody deselectOnClickaway={false} displayRowCheckbox={false}>
            {props.users.map(user => (
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
      {props.selectedUser && (
        <Dialog
          title={`Edit Time Clock for ${props.selectedUser.first_name} ${
            props.selectedUser.last_name
          }`}
          actions={actions}
          modal
          open={props.isDialogOpen}>
          <DatePicker
            hintText="Select Date to Edit"
            inputStyle={{ color: 'black' }}
            hintStyle={{ color: 'black' }}
            value={props.employeeEditDate}
            onChange={props.handleEmployeeEditDateChange}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <TimePicker
              disabled={!props.punchedIn}
              format="ampm"
              hintText="Punched In"
              defaultTime={props.punchedIn}
              value={props.punchedIn}
              onChange={props.handlePunchedInTimeChange}
            />
            <TimePicker
              disabled={!props.punchedOut}
              format="ampm"
              hintText="Punched Out"
              defaultTime={props.punchedOut}
              value={props.punchedOut}
              onChange={props.handlePunchedOutTimeChange}
            />
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default ManageUsers;

ManageUsers.propTypes = {
  handlePunchedOutTimeChange: PropTypes.func.isRequired,
  handlePunchedInTimeChange: PropTypes.func.isRequired,
  handleEmployeeEditDateChange: PropTypes.func.isRequired,
  punchedOut: PropTypes.instanceOf(Date),
  punchedIn: PropTypes.instanceOf(Date),
  employeeEditDate: PropTypes.instanceOf(Date),
  selectedUser: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string
  }),
  users: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      email: PropTypes.string,
      first_name: PropTypes.string,
      last_name: PropTypes.string,
      isAdmin: PropTypes.bool
    })
  ).isRequired,
  isDialogOpen: PropTypes.bool.isRequired,
  openDialog: PropTypes.func.isRequired,
  closeDialog: PropTypes.func.isRequired,
  updateTimeClock: PropTypes.func.isRequired
};

ManageUsers.defaultProps = {
  punchedOut: null,
  punchedIn: null,
  employeeEditDate: null,
  selectedUser: null
};
