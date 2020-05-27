
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

const connectDB = require('./db');

const app = express();

connectDB();
const Usr = require('./models/User');

// initialize Passport
initializePassport(
  passport
);


// set view engine to ejs
app.set('view-engine', 'ejs');

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

// Route to homepage
app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name });
});

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

// Route to register POST, on form submit
app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

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

  } catch {
    res.redirect('/register');
  }
});


// Logout
app.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login');
})


function checkAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {

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
