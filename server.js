const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const MessageModel = require('./model/message-model');
const UserModel = require('./model/user-model');
const { validationResult } = require('express-validator');

//validators
const validators = require('./validation/validators');

const DBURL = process.env.mongodbURL || 'mongodb://127.0.0.1:27017/test-db';

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true }));

//Database connection
mongoose.connect(DBURL, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', () => {
    console.error("DB connection failed.");
});
db.once('open', () => {
    console.log("DB connection established.");
});

const user = 'Phil Stene';

//Routes
app.get('/', (req, res) => {
   res.render('login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', validators.userValidators, (req, res) => {
    const errors = validationResult(req).formatWith(({location, msg, param, value, nestedErrors}) => {
        return `${param}[${escape(value)}]: ${msg}`;
    });
    if (!errors.isEmpty()) {
        console.log(errors.array());
        res.render('register', { parsedErrors: validators.ValidationErrorOutput(errors.array()) });
    } else {
        console.log(req.body);
        UserModel.find({ userID: req.body.userID, name: req.body.name }, (err, docs) => {
            if(err) console.error(err);
            console.log('docs.length = ' + docs.length);
            if(docs.length > 0) {
                res.render('register', { err_msg: "User already exists, please try again." });
            } else {
                const newUser = new UserModel(req.body);
                console.log(newUser);
                newUser.save((err, msg) => {
                    if(err) return console.log(err);
                    res.render('login', { name: req.body.name });
                });
            }
        });
    }
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/messages', (req, res) => {
    MessageModel.find({ recipient: user }).sort({date: 'desc'}).exec((err, records) => {
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

app.post('/messages', validators.messageValidators, (req, res) => {
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

app.get('/send', (req, res) => {
    UserModel.find({}).sort({date: 'desc'}).exec((err, records) => {
        if(err) console.error(err);
        let users = records.reduce((acc, curr) => {
            return acc + '<option value="' + curr.name + '">' + curr.name + '</option>';
        }, '');
        res.render('send', { data: users, page: 'send' });
    });
});

app.get('*', (req, res) => {
    res.render('error');
});

app.listen(port, () => {
    console.log(`listening on port ${port}`)
});