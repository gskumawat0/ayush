const mongoose = require("mongoose");

var messageSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    mobile: Number,
    name: String,
    location: String,
    date: Date,
    duration: String,
    message: String
}, { usePushEach: true });

module.exports = mongoose.model("Message", messageSchema);
