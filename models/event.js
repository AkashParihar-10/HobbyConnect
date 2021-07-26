const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
    title: String,
    image: String,
    description: String,
    maxCount: Number,
    Address: String,
    date: { day: Number, month: Number, year: Number },
    time: { hr: Number, min: Number },
    registered: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});
module.exports = mongoose.model("Event", eventSchema);