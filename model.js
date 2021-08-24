const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Message = new Schema(
    {
        userID: {
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
    { collection: "RTS-Messages"}
);

module.exports = mongoose.model("messages", Message);