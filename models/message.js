const mongoose = require("mongoose");

var messageSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    mobile: Number,
    name: String,
    location: String,
    showDate: Date,
    duration: String,
    message: String,
    date: { type: Date, default: Date.now() }
}, { usePushEach: true });

module.exports = mongoose.model("Message", messageSchema);
