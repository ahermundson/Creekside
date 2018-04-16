/* eslint no-console:0 */
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const moment = require('moment');

const JobClock = require('./models/jobclock-model');
const TimeClock = require('./models/timeclock-model');
const Location = require('./models/location-model');
const User = require('./models/user-model');
const mongoConnection = require('./modules/mongo-connection');
const auth = require('./AuthUtil/AuthUtil');

// Collect Cognito auth information
let authPems = {};
const successPemCallback = pems => {
  authPems = pems;
};
const errorPemCallback = () => console.log('Error in getting auth pems');
auth.createPems(successPemCallback, errorPemCallback);

const app = express();

mongoose.Promise = global.Promise;
mongoConnection.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const corsOptions = {
  origin: 'http://creeksidelawnandlandscape.s3-website.us-east-2.amazonaws.com',
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.get('/user', (req, res) => {
  if (req.query.username) {
    User.find({ username: req.query.username }).exec((err, data) => {
      if (!err) {
        res.send(data);
      } else {
        res.sendStatus(500);
      }
    });
  } else {
    User.find().exec((err, data) => {
      if (!err) {
        res.send(data);
      } else {
        res.sendStatus(500);
      }
    });
  }
});

app.post('/user', (req, res) => {
  auth.validateToken(authPems, req.headers.authorization).then(response => {
    if (response) {
      const isAdmin =
        response.payload['cognito:groups'] &&
        response.payload['cognito:groups'].includes('Admin');
      const userToAdd = new User({
        username: req.body.username,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        isAdmin
      });

      userToAdd.save((err, data) => {
        if (err) {
          console.log('Error: ', err);
          res.sendStatus(500);
        } else {
          res.send(data);
        }
      });
    } else {
      console.log('Error');
    }
  });
});

app.get('/location', (req, res) => {
  Location.find().exec((err, data) => {
    if (!err) {
      res.send(data);
    } else {
      res.sendStatus(500);
    }
  });
});

app.get('/timeClock', (req, res) => {
  TimeClock.find({ user_id: req.query.userId, active_timeclock: true }).exec(
    (err, data) => {
      if (!err) {
        res.send(data);
      } else {
        res.sendStatus(500);
      }
    }
  );
});

app.post('/timeclock', (req, res) => {
  // console.log(req.body.punched_in);
  const timeclockToAdd = new TimeClock({
    punched_in: req.body.punched_in,
    user_id: req.body.user_id,
    active_timeclock: req.body.active_timeclock,
    location_id: req.body.location_id
  });

  timeclockToAdd.save((err, data) => {
    if (err) {
      console.log('Error: ', err);
      res.sendStatus(500);
    } else {
      res.send(data);
    }
  });
});

app.put('/timeClockUpdate', (req, res) => {
  TimeClock.findOneAndUpdate(
    { user_id: req.body.userId, active_timeclock: true },
    { $set: { punched_out: req.body.punchOutTime, active_timeclock: false } },
    err => {
      if (err) {
        console.log('Put ERR: ', err);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    }
  );
});

app.post('/jobclock', (req, res) => {
  const jobClockToAdd = new JobClock({
    job_started: req.body.job_started,
    user_id: req.body.user_id,
    active_job: true,
    location_id: req.body.location_id
  });

  jobClockToAdd.save((err, data) => {
    if (err) {
      console.log('Error: ', err);
      res.sendStatus(500);
    } else {
      res.send(data);
    }
  });
});

app.put('/jobClockUpdate', (req, res) => {
  JobClock.findOneAndUpdate(
    { user_id: req.body.userId, active_job: true },
    { $set: { job_finished: req.body.job_finished, active_job: false } },
    err => {
      if (err) {
        console.log('Put ERR: ', err);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    }
  );
});

app.get('/allUserTimeClock', (req, res) => {
  const decoded = jwt.verify(
    req.headers.authorization,
    Buffer.from(process.env.AUTH_SECRET),
    { algorithms: ['HS256'] }
  );
  if (decoded) {
    User.find({ email: decoded.email, isAdmin: true }).exec((err, data) => {
      if (data.length) {
        TimeClock.find({
          punched_in: { $gte: req.query.startDate, $lte: req.query.endDate },
          user_id: req.query.userID
        }).exec((timeClockErr, timeClockData) => {
          if (!timeClockErr) {
            res.send(timeClockData);
          } else {
            console.log(timeClockErr);
          }
        });
      } else {
        res.sendStatus(500);
      }
    });
  } else {
    res.sendStatus(500);
  }
});

app.get('/employeeHours', (req, res) => {
  TimeClock.find({
    user_id: req.query.user_id,
    punched_out: { $gte: req.query.startDate, $lte: req.query.endDate }
  }).exec((err, data) => {
    if (!err) {
      res.send(data);
    } else {
      res.sendStatus(500);
    }
  });
});

app.get('/singleTimeClock', (req, res) => {
  const start = moment(req.query.date).startOf('day');
  const end = moment(start).add(1, 'days');
  TimeClock.find({
    user_id: req.query.userId,
    punched_in: {
      $gte: moment(start).format(),
      $lt: moment(end).format()
    }
  }).exec((err, data) => {
    if (!err) {
      res.send(data);
    } else {
      res.sendStatus(500);
    }
  });
});

app.put('/singleTimeClock', (req, res) => {
  TimeClock.findOneAndUpdate(
    { _id: req.body.timeClockID },
    {
      $set: {
        punched_in: req.body.punched_in,
        punched_out: req.body.punched_out
      }
    },
    err => {
      if (err) {
        console.log('Put ERR: ', err);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    }
  );
});

// 8081 for AWS
app.listen(3001, () => console.log('Example app listening on port 3001!'));
