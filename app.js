const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const MessageModel = require('./model/message-model');
const UserModel = require('./model/user-model');
const { validationResult } = require('express-validator');
const dotenv = require('dotenv');
const landingRouter = require('./routes/landing');
const loginRouter = require('./routes/login');
const messagesRouter = require('./routes/messages');
const sendRouter = require('./routes/send');
const errorRouter = require('./routes/error');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true }));

//Database connection
const DBURL = process.env.mongodbURL || 'mongodb://127.0.0.1:27017/test-db';
mongoose.connect(DBURL, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', () => {
    console.error("DB connection failed.");
});
db.once('open', () => {
    console.log("DB connection established.");
});

const user = 'Phil Stene';

// Routes
app.use('/', landingRouter);
app.use('/', loginRouter);
app.use('/', messagesRouter);
app.use('/', sendRouter);
app.use('/', errorRouter);

module.exports = app;