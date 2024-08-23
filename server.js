require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require('express-session');

const app = express();

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Morgan for logging HTTP requests
app.use(morgan('dev'));
// Serves static assets to the browser
app.use(express.static('public'));
// Middleware to parse URL-encoded data from forms
// express.urlencoded is what creates req.body
app.use(express.urlencoded({ extended: false }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride("_method"));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Require the middleware that adds the user doc to the req & the res.locals objects
const addUserToReqAndLocals = require('./middleware/addUserToReqAndLocals');
// Be sure to mount after the session middleware above
app.use(addUserToReqAndLocals);


// Routes/Controllers

const ensureLoggedIn = require('./middleware/ensureLoggedIn');

// '/auth' is a "starts with" path that all paths
// within authCtrl are appended to
app.use('/auth', require('./controllers/auth'));
app.use('/todos', require('./controllers/todos'));
// If you wanted to protect ALL routes 
// app.use('/todos', ensureLoggedIn, require('./controllers/todos'));

const training = {
  name: 'Dynamic Soccer Training Sessions',
  isAvailable: true,
  addressOne: '11536 Bailey Rd, Cornelius, NC  28031',
  addressTwo: '13789 Beatties Ford Rd, Huntersville, NC  28078',
  phone: '704.777.3112',
  sessions: [
    {
      name: 'One On One Dynamic Session',
      players: 'MAX 2 Players',
      price: 45.00,
      description: 'A personlized session for your player to develop their skills and game undestanding through experiential activities.'
    },
    {
      name: 'Small Group Dynamic Session',
      players: 'MAX 8 Players',
      price: 35.00,
      description: 'A personlized session that has technical focus, tactical awareness individually and as a team unit'
    },
    {
      name: 'Large Group/Team Dynamic Session',
      players: 'MAX 24 Players',
      price: 25.00,
      description: 'A personlized session for a large group that allows for specific teamwork and tactical awareness'
    },
    {
      name: 'Custom Group Dynamic Session',
      players: 'TO BE DETERMINED',
      price: 'TO BE DETERMINED',
      description: 'Discussed prior to final booking. Determine exact needs and wants.'
    },
  ]
}

// GET / (root/landing page)
app.get('/', (req, res) => {
  res.render('home.ejs', {training});
});

app.get('/train', (req, res) => {
  res.render('train.ejs', {training});
});


// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : "3000";
// An alternative to above
// const port = process.env.PORT || "3000";

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
