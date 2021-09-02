const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Message = new Schema(
    {
        username: {
            type: String
        },
        recipient: {
            type: String
        },
        message: {
            type: String
        },
        date: {
            type: Date
        }
    },
    { collection: "RTSMessages"}
);

module.exports = mongoose.model("messages", Message);