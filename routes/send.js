const express = require('express');
const UserModel = require("../model/user-model");
const secured = require("../lib/middleware/secured");
const router = express.Router();

// send route
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