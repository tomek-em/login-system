const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// create schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

// create model
const User = mongoose.model('User', userSchema);

module.exports = User;
