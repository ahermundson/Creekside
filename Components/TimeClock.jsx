import React from 'react';
import SelectField from 'material-ui/SelectField';
import RaisedButton from 'material-ui/RaisedButton';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';

import {
  punchOut,
  startJob,
  finishJob,
  toggleLoader
} from '../redux/actionCreators';

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

const TimeClock = props => {
  const onPunchOutClick = () => {
    props.punchOut(props.userInfo._id);
  };

  const onStartJobClick = () => {
    props.startJob(props.userInfo._id, new Date(), this.state.selectedLocation);
    this.setState({
      selectedLocation: null
    });
  };

  const onFinishJobClick = () => {
    props.finishJob(props.userInfo._id);
  };

  return (
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
      >{`Welcome ${props.userInfo.first_name} ${props.userInfo.last_name}`}</h3>
      <SelectField
        disabled={props.activeJob}
        labelStyle={{ color: 'white' }}
        selectedMenuItemStyle={{ color: 'tan' }}
        value={props.selectedLocation}
        floatingLabelText="Select Job Location"
        floatingLabelStyle={{ color: 'white' }}
        onChange={props.handleLocationChange}
      >
        {props.locationMenuItems}
      </SelectField>
      {!props.activeJob ? (
        <RaisedButton
          label="Start Job"
          style={styles.main}
          buttonStyle={styles.button}
          labelStyle={styles.buttonLabel}
          onClick={onStartJobClick}
        />
      ) : (
        <RaisedButton
          label="Finish Job"
          style={styles.main}
          buttonStyle={styles.button}
          labelStyle={styles.buttonLabel}
          onClick={onFinishJobClick}
        />
      )}
      <RaisedButton
        label="Punch Out"
        style={styles.main}
        buttonStyle={styles.button}
        labelStyle={styles.buttonLabel}
        onClick={onPunchOutClick}
      />
    </div>
  );
};

const mapStateToProps = state => ({
  userInfo: state.userInfo,
  activeTimeClock: !isEmpty(
    state.timeClock.find(timeClock => timeClock.activeTimeClock)
  ),
  activeJob: !isEmpty(state.jobClock.find(jobClock => jobClock.activeJob))
});

const mapDispatchToProps = dispatch => ({
  punchOut(userId) {
    dispatch(punchOut(userId));
  },
  startJob(userId, time, location) {
    dispatch(startJob(userId, time, location));
  },
  finishJob(userId) {
    dispatch(finishJob(userId));
  },
  toggleLoader() {
    dispatch(toggleLoader());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(TimeClock);

TimeClock.propTypes = {
  userInfo: PropTypes.shape({
    _id: PropTypes.string,
    email: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    isAdmin: PropTypes.bool,
    isAuthenticated: PropTypes.bool
  }),
  activeJob: PropTypes.bool,
  selectedLocation: PropTypes.string,
  handleLocationChange: PropTypes.func.isRequired,
  locationMenuItems: PropTypes.arrayOf(PropTypes.element),
  punchOut: PropTypes.func.isRequired,
  startJob: PropTypes.func.isRequired,
  finishJob: PropTypes.func.isRequired
};

TimeClock.defaultProps = {
  userInfo: {},
  activeJob: false,
  selectedLocation: null,
  locationMenuItems: null
};
