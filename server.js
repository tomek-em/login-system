
if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const initializePassport = require('./passport-config');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

// db file
const connectDB = require('./db');

const app = express();

connectDB();
const Usr = require('./models/User');

// users data. dev only not acceptable in production
const users = [];
// initialize Passport for hardcoded user
initializePassport(
  passport
  // email => users.find(user => user.email === email)
  // id => users.find(user => user.id === id)
);

function initialize() {
  console.log('init');
  // Usr.findOne({
  //   email: 'user@post.com'
  // })
  // .then(function(response){
  //   if(response != null) {
  //     res.render('index.ejs', { name: response.name });
  //     console.log(response.id);
  //     users.push(response);
  //     console.log(users);
  //   } else {
  //
  //   }
  // });
}

// initialize();

// set view engine to ejs & to be able to send params to ejs files
app.set('view-engine', 'ejs');
// to be able to use in express data from form inputs(eg. req.body.email = <input name="email>):
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// Route to homepage - see checkAuthenticate fun below at the end, if there is no user redirect to login
app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name });
});

// app.get('/', (req, res) => {
//   //read user from db
//   Usr.findOne({
//     email: 'user@post.com'
//   })
//   .then(function(response){
//     if(response != null) {
//       res.render('index.ejs', { name: response.name });
//     } else {
//       res.render('index.ejs', { name: 'You are not logged in' });
//     }
//   });
// });

// Route to login
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs');
});

// Route to login POST, on form submit - USE passport middleware
app.post('/login',checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

// Route to register
app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs');
});

// Route to register POST, on form submit (async beause of bcrypt)
app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // bcypt is async, 10 safety level, default

    // save to user obj
    // users.push({
    //   id: Date.now().toString(),  // generates unic key form date, AUTOMATICLY generated if use MONGODB
    //   name: req.body.name,
    //   email: req.body.email,    //req.body.email = <input name="email>
    //   password: hashedPassword
    // });

    // Save User to db
    let u = await Usr.findOne({ email: req.body.email });
    if (u) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    u = new Usr({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });
    u.save()
    .then(() => {
      console.log('user saved');
      res.redirect('/');
    });

    // res.redirect('/login');
  } catch {
    res.redirect('/register');
  }
  console.log(users);
});


// Logout
app.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login');
})


// check if there is authenticated user for session
function checkAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    // let function using checkAuthenticate to continue
    return next();
  } else {
    // no authenticated user return to login
    res.redirect('/login');
  }
}


function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

app.listen(3000);
