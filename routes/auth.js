const express = require('express');
const UserModel = require("../model/user-model");
const router = express.Router();
const passport = require('passport');
const dotenv = require('dotenv');
const util = require('util');
const url = require('url');
const querystring = require('querystring');

dotenv.config();

// login routes

// Perform the login, after login Auth0 will redirect to callback
router.get('/login', passport.authenticate('auth0', {
    scope: 'openid email profile'
}), (req, res) => {
    res.redirect('/messages');
});

// Perform the final stage of authentication and redirect to previously requested URL or '/user'
router.get('/callback', (req, res, next) => {
    passport.authenticate('auth0', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/'); }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            const returnTo = req.session.returnTo;
            delete req.session.returnTo;
            // redirect to /messages if user is in the system, otherwise redirect to /register
            UserModel.find({ username: user._json.email }).exec((err, records) => {
                if(err) console.error(err);
                // user found
                if(records.length > 0) {
                    res.redirect(returnTo || '/messages');
                }
                // user not found
                else {
                    res.redirect(returnTo || '/register');
                }
            });
        });
    })(req, res, next);
});


// logout routes
router.get('/lgo', (req, res) => {
    let returnTo = req.protocol + '://' + req.hostname;
    const port = req.connection.localPort;
    if (port !== undefined && port !== 80 && port !== 443) {
        returnTo = process.env.NODE_ENV === 'production' ? `${returnTo}/logout` : `${returnTo}:${port}/logout`;
    }

    req.logout();

    if(req.session) {
        req.session.destroy( (err) => {
            if(err) console.error(err);

            let logoutURL = new url.URL(
                util.format('https://%s/v2/logout', process.env.AUTH0_DOMAIN)
            );

            const searchString = querystring.stringify({
                client_id: process.env.AUTH0_CLIENT_ID,
                returnTo: returnTo
            });
            logoutURL.search = searchString;

            res.redirect(logoutURL);
        });
    }
});

router.get('/logout' , (req, res) => {
    res.render('logout');
});

module.exports = router;