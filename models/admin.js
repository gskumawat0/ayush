const mongoose = require("mongoose");

var adminSchema = new mongoose.Schema({
    images: [{
        image: String,
        key: String
    }],
    profileImg: {
        image: String,
        key: String
    },
    videos: [
        {
            ytVideoUrl: String
        }]
}, { usePushEach: true });

module.exports = mongoose.model("Admin", adminSchema);
