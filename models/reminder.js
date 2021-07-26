const mongoose = require('mongoose');

let RemSchema = new mongoose.Schema({
    username: String,
    title: String,
    Description: String,
    date: { day: Number, month: Number, year: Number },
    time: { hr: Number, min: Number },
});

module.exports = mongoose.model('reminder', RemSchema);