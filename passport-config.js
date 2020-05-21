const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('./models/User');

let users = [];
function initialize(passport) {
  let getUserByEmail;
  let getUserById;

  const authenticateUser = async (email, password, done) => {
    // check email
    // const user = getUserByEmail(email);
    // if(user == null) {
    //   // console.log(email, ' user.email ', user.email);
    //   return done(null, false, {message: 'No user found'});  // null -> err if use database
    // }

    // check user and pass
    try {
      user = await User.findOne({ email });

      console.log(user)

      if (!user) {
        return done(null, false, {message: 'No user found'});
      } else {
        // return done(null, false, {message: 'User found'});
        users.push(user);
        // getUserByEmail = (email) => users.find(user => user.email === email);
        // getUserById = (id) => users.find(user => user.id === id);
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

  // let em = new LocalStrategy({ usernameField: 'email' }, authenticateUser);
  // console.log('passport ', em, passport);

  passport.use(new LocalStrategy({ usernameField: 'email' },
  authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id));
  });
}

module.exports = initialize;
