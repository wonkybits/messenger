const express = require('express');
const MessageModel = require("../model/message-model");
const validators = require("../validation/validators");
const {validationResult} = require("express-validator");
const secured = require('../lib/middleware/secured');
const router = express.Router();

// messages routes
router.get('/messages', secured(), (req, res) => {
    const username = req.user._json.email;
    MessageModel.find({ username: username }).sort({date: 'desc'}).exec((err, records) => {
        let messages = "";

        if(err) console.error(err);

        if(records.length > 0) {
            messages = records.reduce((acc, curr) => {
                return acc + "<tr>\n" +
                    "<td>" + curr.recipient + "</td>\n" +
                    "<td>" + curr.message + "</td>\n" +
                    "<td>" + curr.date + "</td>\n" +
                    "<td><button class='button'>Delete</button></td>\n" +
                    "</tr>";
            }, '');
        } else {
            messages = "<tr><td colspan='3'>No Messages.</td></tr>";
        }

        res.render('messages', { data: messages, page: 'messages' });
    });
});

router.post('/messages', secured(), validators.messageValidators, (req, res) => {
    const errors = validationResult(req).formatWith(({location, msg, param, value, nestedErrors}) => {
        return `${param}[${escape(value)}]: ${msg}`;
    });
    if (!errors.isEmpty()) {
        console.log(errors.array());
        res.render('send', { parsedErrors: validators.ValidationErrorOutput(errors.array()) });
    } else {
        const newMessage = new MessageModel(req.body);
        newMessage.username = 'test';
        newMessage.date = new Date(Date.now()).toISOString();
        newMessage.save((err, msg) => {
            if(err) return console.log(err);
            res.redirect('messages');
        });
    }
});

module.exports = router;