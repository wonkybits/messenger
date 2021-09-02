const express = require('express');
const validators = require("../validation/validators");
const {validationResult} = require("express-validator");
const UserModel = require("../model/user-model");
const router = express.Router();

// login routes

router.get('/login', (req, res) => {
    // res.render('login');
    res.render('register');
});

// router.post('/login', (req, res) => {
//     const errors = validationResult(req).formatWith(({location, msg, param, value, nestedErrors}) => {
//         return `${param}[${escape(value)}]: ${msg}`;
//     });
//     if (!errors.isEmpty()) {
//         console.log(errors.array());
//         res.render('register', { parsedErrors: validators.ValidationErrorOutput(errors.array()) });
//     } else {
//         console.log(req.body);
//         UserModel.find({ userID: req.body.userID, name: req.body.name }, (err, docs) => {
//             if(err) console.error(err);
//             console.log('docs.length = ' + docs.length);
//             if(docs.length > 0) {
//                 res.render('register', { err_msg: "User already exists, please try again." });
//             } else {
//                 const newUser = new UserModel(req.body);
//                 console.log(newUser);
//                 newUser.save((err, msg) => {
//                     if(err) return console.log(err);
//                     res.render('login', { name: req.body.name });
//                 });
//             }
//         });
//     }
// });

module.exports = router;