import { combineReducers } from 'redux';
import {
  ADD_USER_INFO,
  PUNCH_IN,
  PUNCH_OUT,
  SET_USER_TIMECLOCK,
  START_JOB,
  FINISH_JOB,
  TOGGLE_LOADER
} from './actions';

const isLoading = (state = false, action) => {
  if (action.type === TOGGLE_LOADER) {
    return !state;
  }
  return state;
};

const userInfo = (state = {}, action) => {
  if (action.type === ADD_USER_INFO) {
    return Object.assign(action.payload, { isAuthenticated: true });
  }
  return state;
};

const timeClock = (state = [], action) => {
  switch (action.type) {
    case PUNCH_IN:
      return [
        ...state,
        {
          userId: action.payload.userId,
          activeTimeClock: true,
          punchInTime: action.payload.time,
          locationId: action.payload.locationId,
          timeClockId: action.payload.timeClockId
        }
      ];
    case PUNCH_OUT:
      return state.map(timeClockItem => {
        if (
          timeClockItem.userId !== action.payload.userId &&
          timeClockItem.activeTimeClock
        ) {
          return timeClockItem;
        }
        return {
          userId: action.payload.userId,
          activeTimeClock: false,
          punchInTime: timeClock.punchInTime,
          locationId: timeClock.locationId,
          timeClockId: timeClockItem.timeClockId,
          punchOutTime: action.payload.punchOutTime
        };
      });
    case SET_USER_TIMECLOCK:
      return [
        {
          userId: action.payload.user_id,
          activeTimeClock: true,
          punchInTime: action.payload.punched_in,
          locationId: action.payload.location_id,
          timeClockId: action.payload._id
        }
      ];
    default:
      return state;
  }
};

const jobClock = (state = [], action) => {
  switch (action.type) {
    case START_JOB:
      return [...state, ...action.payload];
    case FINISH_JOB:
      return state.map(jobClockItem => {
        if (
          jobClockItem.userId !== action.payload.userId &&
          !jobClockItem.activeJob
        ) {
          return jobClockItem;
        }
        return {
          userId: action.payload.userId,
          active_job: false,
          jobStartedTime: jobClockItem.jobStartedTime,
          locationId: jobClockItem.locationId,
          jobClockId: jobClockItem.jobClockId,
          jobFinishedTime: action.payload.jobFinishedTime
        };
      });
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  userInfo,
  timeClock,
  jobClock,
  isLoading
});

export default rootReducer;
