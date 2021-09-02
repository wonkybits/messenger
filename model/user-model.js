const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = new Schema(
    {
        username: {
            type: String
        },
        firstname: {
            type: String
        },
        lastname: {
            type: String
        }
    },
    { collection: "RTSUsers"}
);

module.exports = mongoose.model("users", User);