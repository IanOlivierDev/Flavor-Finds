const express = require('express');
const router = express.Router();
const User = require('../models/user');

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

module.exports = router;