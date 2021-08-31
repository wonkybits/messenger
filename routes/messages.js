const express = require('express');
const MessageModel = require("../model/message-model");
const validators = require("../validation/validators");
const {validationResult} = require("express-validator");
const router = express.Router();

// messages routes
router.get('/messages', (req, res) => {
    MessageModel.find({  }).sort({date: 'desc'}).exec((err, records) => {
        if(err) console.error(err);
        let messages = records.reduce((acc, curr) => {
            return acc + "<tr>\n" +
                "<td>" + curr.recipient + "</td>\n" +
                "<td>" + curr.message + "</td>\n" +
                "<td>" + curr.date + "</td>\n" +
                "</tr>";
        }, '');
        res.render('messages', { data: messages, page: 'messages' });
    });
});

router.post('/messages', validators.messageValidators, (req, res) => {
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

module.exports = router;