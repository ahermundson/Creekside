/* eslint-disable */

import axios from 'axios';
import {
  ADD_USER_INFO,
  PUNCH_IN,
  PUNCH_OUT,
  SET_USER_TIMECLOCK,
  GET_USER_TIMECLOCK_DATA,
  START_JOB,
  FINISH_JOB
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

export function startJobDispatch(
  userId,
  jobStartedTime,
  locationId,
  jobClockId,
  activeJob
) {
  return {
    type: START_JOB,
    payload: {
      userId,
      jobStartedTime,
      locationId,
      jobClockId,
      activeJob
    }
  };
}

export function startJob(userId, jobStartedTime, locationId) {
  return dispatch => {
    axios
      .post(`${serverAddress}/jobclock`, {
        job_started: jobStartedTime.toString(),
        active_job: true,
        user_id: userId,
        location_id: locationId
      })
      .then(response => {
        dispatch(
          startJobDispatch(
            userId,
            jobStartedTime.toString(),
            locationId,
            response.data._id,
            true
          )
        );
      })
      .catch(error => {
        console.error('Error punching in', error);
      });
  };
}

export function setUserTimeClock(timeClockObj) {
  return {
    type: SET_USER_TIMECLOCK,
    payload: timeClockObj
  };
}

export function jobFinishedDispatch(userId, jobFinishedTime) {
  return {
    type: FINISH_JOB,
    payload: {
      userId,
      jobFinishedTime
    }
  };
}

export function finishJob(userId) {
  return dispatch => {
    axios
      .put(`${serverAddress}/jobClockUpdate`, {
        userId: userId,
        job_finished: new Date().toString()
      })
      .then(response => {
        dispatch(jobFinishedDispatch(userId, new Date().toString()));
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
