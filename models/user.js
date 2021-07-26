const mongoose = require('mongoose');
const express = require('express');
passportLocalMongoose = require('passport-local-mongoose');


const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    email: String,
    mobile: String,
    age: String,
    friend: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    sentreq: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    receivereq: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    hobbies: [{
        type: String
    }],
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event"
    }],
    latitude: Number,
    longitude: Number,
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);