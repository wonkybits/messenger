const express = require('express');
const MessageModel = require("../model/message-model");
const router = express.Router();

router.get('/deletemsg', (req, res) => {
    console.log('msgid = ' + req.query.msgid);
    MessageModel.findByIdAndDelete(req.query.msgid, (err) => {
        if(err) console.log(err);
        res.redirect('/messages');
    });
});

module.exports = router;