const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = new Schema(
    {
        userID: {
            type: String
        },
        name: {
            type: String
        },
        password: {
            type: String
        }
    },
    { collection: "RTSUsers"}
);

module.exports = mongoose.model("users", User);