const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    // check email
    const user = getUserByEmail(email);
    if(user == null) {
      // console.log(email, ' user.email ', user.email);
      return done(null, false, {message: 'No user found'});  // null -> err if use database
    }

    // check pass
    try {
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
    return done(null, getUserById(id));
  });
}

// export fun to be able to call it from server.js
module.exports = initialize;
