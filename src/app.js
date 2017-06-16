const path = require('path');
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const url = require('url');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const port = process.env.PORT || process.env.NODE_PORT || 3000;
const dbURL = process.env.MONGODB_URI || 'mongodb://localhost/apollo';

// ---------- Connect to database ---------------
mongoose.connect(dbURL, (error) => {
    if (error) {
        console.log('Could not connect to database');
        throw error;  // TODO: May want to do something more intelligent here
    }
});

// ---------- Hook up Redis ---------------------
// Port 6379 is the redis default
let redisURL = {
    hostname: 'localhost',
    port: 6379,
};

let redisPassword;

// This is fairly specific to Heroku
if (process.env.REDISCLOUD_URL) {
    redisURL = url.parse(process.env.REDISCLOUD_URL);
    redisPassword = redisURL.auth.split(':')[1];
}

// ---------- Configure passport ----------
// Could (probably should) also put all this in its own file

// Passport needs these to manage authentication across requests
passport.serializeUser((user, callback) => {
    // callback(null, someUserID);
});

passport.deserializeUser((id, callback) => {
    // callback(errFromDeserializationProcess, someUser);
});

// Tell passport to use the local (username & password) auth strategy
passport.use(new localStrategy(
    (username, password, callback) => {
        // Perform checks 
    }));

// ---------- Setup express & router ------------
const app = express();
app.disable('x-powered-by');  // disable the x-powered-by header so we don't leak our architecture
app.use(compression());       // To reduce size of messages we send to client
// Parse only urlencoded bodies and populate req.body
//app.use(bodyParser.json()); // Needed for certain request libs (e.g. superagent), enable if issues
app.use(bodyParser.urlencoded({
    extended: true,             // Parse using the qs library
}));
app.use(cookieParser());
app.use(session({
    key: 'sessionid',           // Name of cookie
        store: new RedisStore({ // Use Redis as our memory store for session
        host: redisURL.hostname,
        port: redisURL.port,
        pass: redisPassword,
    }),
    secret: 'Cool tapes',       // TODO: Look into rotating secrets
    resave: true,               // Refresh key to keep it active - may have repercussions in production
    saveUninitialized: true,
    cookie: {
        httpOnly: true,         // Disallow JS access to cookies
                                // TODO: look into maxAge & secure properties
    },
}));

// ---------- Set up router ---------------------
const router = require('./router.js');

router(app);


// ---------- Start listening for requests ------
app.listen(port, (error) => {
    if (error) {
        throw error;  // TODO: May want to do something more intelligent here
    }

    console.log(`Listening on port ${port}`);
});