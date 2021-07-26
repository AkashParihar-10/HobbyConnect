const mongoose = require('mongoose');
const express = require('express');


const dotenv = require('dotenv');
const URL = process.env.DATABASE;


//let URL = process.env.DATABASEURL || 'mongodb://localhost:27017/hobby';


mongoose.connect(URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
}).then(() => {
    console.log(`connected successfully`);
}).catch(() => {
    console.log('no connection');
});
