const express = require('express');
const UserModel = require("../model/user-model");
const router = express.Router();

// send route
router.get('/send', (req, res) => {
    UserModel.find({}).sort({date: 'desc'}).exec((err, records) => {
        if(err) console.error(err);
        let users = records.reduce((acc, curr) => {
            return acc + '<option value="' + curr.name + '">' + curr.name + '</option>';
        }, '');
        res.render('send', { data: users, page: 'send' });
    });
});

module.exports = router;