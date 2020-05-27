const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('./models/User');

function initialize(passport) {

  const authenticateUser = async (email, password, done) => {

    // check user and pass
    try {
      user = await User.findOne({ email });

      if (!user) {
        return done(null, false, {message: 'No user found'});
      } else {

      }

      // compare form password with saved user.password
      if(await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Password incorect'});
      }
    } catch (err){
      return done(err);
    } // end of try catch
  }


  passport.use(new LocalStrategy({ usernameField: 'email' },
  authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    return done(null, user);
  });
}

module.exports = initialize;
