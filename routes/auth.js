const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');

router.get('/register', (req, res) =>{
    try {
        res.render('register');
    } catch (error) {
        res.send(error.message);
    }
});

router.post('/register', async (req, res) =>{
    try {
        const {email, username, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        req.flash('success', 'Registered! You can now login!');
        res.redirect('/');
    } catch (error) {
        req.flash('error',`${error.message}`);
        res.redirect('/register');
    }
});

router.get('/login', async(req, res) =>{
    try {
        res.render('login', {isAuthenticated: req.isAuthenticated()});
    } catch (error) {
        req.flash('error',`${error.message}`);
        res.redirect('/login');
    }
});

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (async(req, res) =>{
    try {
        req.flash('success', 'Signed in!');
        res.redirect('/');
    } catch (error) {
        req.flash('error',`${error.message}`);
        res.redirect('/login');
    }
}));

router.get('/logout', (req, res) =>{
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'You have logged out successfully.');
        res.redirect('/');
    });
});

module.exports = router;