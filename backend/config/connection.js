const mongoose = require('mongoose');

const connect = () => {
  const url = 'mongodb://127.0.0.1:27017';
  const dbName = 'lh';

  return mongoose
    .connect(`${url}/${dbName}`)
    .then(() => {
      console.log('Connected to database');
    })
    .catch((err) => {
      console.error('Failed to connect', err);
      throw err;
    });
};

module.exports = {
  connect,
  getConnection: () => mongoose.connection, // Returns the active connection
};
