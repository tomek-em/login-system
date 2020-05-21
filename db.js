const mongoose = require('mongoose');

function db () {

  mongoose.connect('mongodb+srv://user1:pass1@cluster0-7eian.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true,
  useUnifiedTopology: true, } );

  mongoose.connection.once('open', function() {
    console.log('db connected');
  }).on('error', function(err) {
    console.log("Connection error", err);
  })

} // end of db

module.exports = db;
