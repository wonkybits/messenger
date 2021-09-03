const express = require('express');
const UserModel = require('../model/user-model');
const validators = require("../validation/validators");
const {validationResult} = require("express-validator");
const secured = require("../lib/middleware/secured");
const router = express.Router();

router.get('/register', secured(), (req, res) => {
    console.log('register route');
    res.render('register');
});

router.post('/register', secured(), validators.userValidators, (req, res) => {
    const errors = validationResult(req).formatWith(({location, msg, param, value, nestedErrors}) => {
        return `${param}[${escape(value)}]: ${msg}`;
    });
    if (!errors.isEmpty()) {
        console.log(errors.array());
        res.render('register', { parsedErrors: validators.ValidationErrorOutput(errors.array()) });
    } else {
        const newUser = new UserModel(req.body);
        newUser.username = req.user._json.email;
        newUser.save((err, msg) => {
            if(err) return console.log(err);
            res.redirect('/messages');
        });
    }
});

module.exports = router;