const express = require('express');
const MessageModel = require("../model/message-model");
const UserModel = require("../model/user-model");
const validators = require("../validation/validators");
const {validationResult} = require("express-validator");
const secured = require('../lib/middleware/secured');
const router = express.Router();

router.get('/messages', secured(), (req, res) => {
    const username = req.user._json.email;
    MessageModel.find({ recipient: username }).sort({date: 'desc'}).exec((err, records) => {
        let messages = "";

        if(err) console.error(err);

        if(records.length > 0) {
            messages = records.reduce((acc, curr) => {
                return acc + "<tr>\n" +
                    "<td>" + curr.sender + "</td>\n" +
                    "<td>" + curr.message + "</td>\n" +
                    "<td>" + curr.date + "</td>\n" +
                    "<td><button class='button' onclick='javascript:window.location.href=\"/deletemsg?msgid=" + curr._id + "\"'>Delete</button></td>\n" +
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
        newMessage.sender = req.user._json.email;
        newMessage.date = new Date(Date.now()).toISOString();
        newMessage.save((err, msg) => {
            if(err) return console.log(err);
            res.redirect('messages');
        });
    }
});

router.get('/deletemsg', (req, res) => {
    console.log('msgid = ' + req.query.msgid);
    MessageModel.findByIdAndDelete(req.query.msgid, (err) => {
        if(err) console.log(err);
        res.redirect('/messages');
    });
});

router.get('/send', secured(), (req, res) => {
    UserModel.find({}).sort({date: 'desc'}).exec((err, records) => {
        if(err) console.error(err);
        let recipients = '';
        if(records.length > 0) {
            recipients += '<select name="recipient" id="recipient" required><option value="">Select recipient</option>';
            recipients += records.reduce((acc, curr) => {
                if(curr.username == req.user._json.email) {
                    return acc;
                } else {
                    return acc + '<option value="' + curr.username + '">' + curr.firstname  + ' ' + curr.lastname + '</option>';
                }
            }, '');
            recipients += '</select>';
        } else {
            recipients += '<input id="recipient" name="recipient" type="text" placeholder="Ex: abcd@defg.com" pattern="email" required/>';
        }

        res.render('send', { recipients: recipients, page: 'send' });
    });
});

module.exports = router;