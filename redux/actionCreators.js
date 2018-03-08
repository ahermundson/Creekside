/* eslint-disable */

import axios from 'axios';
import {
  ADD_USER_INFO,
  PUNCH_IN,
  PUNCH_OUT,
  SET_USER_TIMECLOCK,
  GET_USER_TIMECLOCK_DATA
} from './actions';

// const serverAddress =
//   'http://helloworld-hermundson.us-east-2.elasticbeanstalk.com';
const serverAddress = '/api';

export function addUserInfo(userData) {
  return { type: ADD_USER_INFO, payload: userData };
}

export function getUserInfo(email) {
  return dispatch => {
    axios
      .get(`${serverAddress}/user?email=${email}`)
      .then(response => {
        if (response.data.length) {
          dispatch(addUserInfo(response.data[0]));
          dispatch(getUserTimeClock(response.data[0]._id));
        } else {
          console.log('No User Info available');
        }
      })
      .catch(error => {
        console.error('axios error', error);
      });
  };
}

export function punchInDispatch(userId, time, locationId, timeClockId) {
  return {
    type: PUNCH_IN,
    payload: {
      userId,
      time,
      locationId,
      timeClockId
    }
  };
}

export function punchIn(userId, time, locationId) {
  console.log(time.toString());
  return dispatch => {
    axios
      .post(`${serverAddress}/timeclock`, {
        punched_in: time.toString(),
        active_timeclock: true,
        user_id: userId,
        location_id: locationId
      })
      .then(response => {
        dispatch(
          punchInDispatch(
            userId,
            time.toString(),
            locationId,
            response.data._id
          )
        );
      })
      .catch(error => {
        console.error('Error punching in', error);
      });
  };
}

export function punchOutDispatch(userId, punchOutTime) {
  return {
    type: PUNCH_OUT,
    payload: {
      userId,
      punchOutTime
    }
  };
}

export function setUserTimeClock(timeClockObj) {
  return {
    type: SET_USER_TIMECLOCK,
    payload: timeClockObj
  };
}

export function punchOut(userId) {
  return dispatch => {
    axios
      .put(`${serverAddress}/timeClockUpdate`, {
        userId: userId,
        punchOutTime: new Date().toString()
      })
      .then(response => {
        dispatch(punchOutDispatch(userId, new Date().toString()));
      });
  };
}

function getUserTimeClock(userId) {
  return dispatch => {
    axios.get(`${serverAddress}/timeClock?userId=${userId}`).then(response => {
      if (response.data.length) {
        dispatch(setUserTimeClock(response.data[0]));
      }
    });
  };
}
