const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, { usePushEach: true });

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
