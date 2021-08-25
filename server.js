const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const session = require('express-session');
const util = require('util');
const url = require('url');
const querystring = require('querystring');
const secured = require('./lib/secured');
const userInViews = require('./lib/userInViews');

const MessageModel = require('./model/message-model');
const UserModel = require('./model/user-model');
const { validationResult } = require('express-validator');
require("dotenv").config();

//validators
const validators = require('./validation/validators');

const DBURL = process.env.mongodbURL || 'mongodb://127.0.0.1:27017/test-db';

const env = process.env.NODE_ENV || "development";
const app = express();
const port = env === "development" ? process.env.DEV_PORT : process.env.PROD_PORT;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true }));

var sess = {
    secret: '31a9d9a0dbbcf77bc5d49516bba26e1d0568770a92f04b1f0c323dba8f2b8e1a',
    cookie: {},
    resave: false,
    saveUninitialized: true
};

if (app.get('env') === 'production') {
    // Use secure cookies in production (requires SSL/TLS)
    sess.cookie.secure = true;

    // Uncomment the line below if your application is behind a proxy (like on Heroku)
    // or if you're encountering the error message:
    // "Unable to verify authorization request state"
    // app.set('trust proxy', 1);
}

app.use(session(sess));

var strategy = new Auth0Strategy(
    {
        domain: process.env.AUTH0_DOMAIN,
        clientID: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        callbackURL:
            process.env.AUTH0_CALLBACK_URL || 'http://localhost:4041/callback'
    },
    function (accessToken, refreshToken, extraParams, profile, done) {
        // accessToken is the token to call Auth0 API (not needed in the most cases)
        // extraParams.id_token has the JSON Web Token
        // profile has all the information from the user
        return done(null, profile);
    }
);

passport.use(strategy);

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

app.use(userInViews());

//Database connection
mongoose.connect(DBURL, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', () => {
    console.error("DB connection failed.");
});
db.once('open', () => {
    console.log("DB connection established.");
});

// const user = 'Phil Stene';

//Routes
app.get('/', (req, res) => {
   res.render('login');
});

app.get('/login', passport.authenticate('auth0'), function (req, res) {
    res.redirect('/messages');
});

app.get('/callback', function (req, res, next) {
    passport.authenticate('auth0', function (err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/login'); }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            const returnTo = req.session.returnTo;
            delete req.session.returnTo;
            res.redirect(returnTo || '/messages');
        });
    })(req, res, next);
});

app.post('/login', validators.userValidators, (req, res) => {
    const errors = validationResult(req).formatWith(({location, msg, param, value, nestedErrors}) => {
        return `${param}[${escape(value)}]: ${msg}`;
    });
    if (!errors.isEmpty()) {
        console.log(errors.array());
        res.render('register', { parsedErrors: validators.ValidationErrorOutput(errors.array()) });
    } else {
        console.log(req.body);
        UserModel.find({ userID: req.body.userID, name: req.body.name }, (err, docs) => {
            if(err) console.error(err);
            console.log('docs.length = ' + docs.length);
            if(docs.length > 0) {
                res.render('register', { err_msg: "User already exists, please try again." });
            } else {
                const newUser = new UserModel(req.body);
                console.log(newUser);
                newUser.save((err, msg) => {
                    if(err) return console.log(err);
                    res.render('login', { name: req.body.name });
                });
            }
        });
    }
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/messages', (req, res) => {
    const { _raw, _json, ...userProfile } = req.user;

    MessageModel.find({ recipient: req.user.username }).sort({date: 'desc'}).exec((err, records) => {
        if(err) console.error(err);
        let messages = records.reduce((acc, curr) => {
            return acc + "<tr>\n" +
                "<td>" + curr.recipient + "</td>\n" +
                "<td>" + curr.message + "</td>\n" +
                "<td>" + curr.date + "</td>\n" +
                "</tr>";
        }, '');
        res.render('messages', { data: messages, page: 'messages', userProfile: JSON.stringify(userProfile, null, 2) });
    });
});

app.post('/messages', validators.messageValidators, (req, res) => {
    const errors = validationResult(req).formatWith(({location, msg, param, value, nestedErrors}) => {
        return `${param}[${escape(value)}]: ${msg}`;
    });
    if (!errors.isEmpty()) {
        console.log(errors.array());
        res.render('send', { parsedErrors: validators.ValidationErrorOutput(errors.array()) });
    } else {
        const newMessage = new MessageModel(req.body);
        newMessage.userID = 'test';
        newMessage.date = new Date(Date.now()).toISOString();
        newMessage.save((err, msg) => {
            if(err) return console.log(err);
            res.redirect('messages');
        });
    }
});

app.get('/send', (req, res) => {
    const { _raw, _json, ...userProfile } = req.user;

    UserModel.find({}).sort({date: 'desc'}).exec((err, records) => {
        if(err) console.error(err);
        let users = records.reduce((acc, curr) => {
            return acc + '<option value="' + curr.name + '">' + curr.name + '</option>';
        }, '');
        res.render('send', { data: users, page: 'send', userProfile: JSON.stringify(userProfile, null, 2) });
    });
});

app.get('/logout', (req, res) => {
    req.logout();

    let returnTo = req.protocol + '://' + req.hostname;
    const port = req.connection.localPort;
    if (port !== undefined && port !== 80 && port !== 443) {
        returnTo += ':' + port + '/login';
    }
    const logoutURL = new url.URL(
        util.format('https://%s/v2/logout', process.env.AUTH0_DOMAIN)
    );
    const searchString = querystring.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        returnTo: returnTo
    });
    logoutURL.search = searchString;

    res.redirect(logoutURL);
});

app.get('*', (req, res) => {
    res.render('error');
});

app.listen(port, () => {
    console.log(`listening on port ${port}`)
});