const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const localStratergy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');

router.get('/register', function (req, res) {
    res.render('register');
});


router.post('/register', function (req, res) {
    let newUser = new User({
        username: req.body.username,
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        age: req.body.age,
        latitude: req.body.latitudeofuser,
        longitude: req.body.longitudeofuser,
    });

    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err.message);
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, function () {
                console.log('Signed up as ' + user.username);
                //req.flash('success', 'Welcome to Hobby Matcher');
                res.redirect('/login');
            });
        }
    });
});


router.get('/login', function (req, res) {
    res.render('login');
});


router.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/mainpage',
        failureRedirect: '/login',
    }),
    function (req, res) { }
);


router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/users');
    console.log('Logged out!!');
});

module.exports = router;