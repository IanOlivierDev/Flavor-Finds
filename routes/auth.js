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

module.exports = router;