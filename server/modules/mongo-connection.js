/* eslint no-console:0 */

const mongoose = require('mongoose');
const connectionString = require('./database-config');

const connectToMongoDatabase = () => {
  mongoose.connect(connectionString);
  mongoose.set('debug', true);

  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to ', connectionString);
  });

  mongoose.connection.on('error', err => {
    console.log('Mongoose failed to connect because error: ', err);
  });
};

module.exports = { connect: connectToMongoDatabase };
