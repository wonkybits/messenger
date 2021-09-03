const express = require('express');
const validators = require("../validation/validators");
const {validationResult} = require("express-validator");
const UserModel = require("../model/user-model");
const router = express.Router();
const passport = require('passport');
const dotenv = require('dotenv');

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

module.exports = router;