const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    email: {
        required: true,
        type: String,
        unique: true
    }
});

//Adds on username and password to the schema
User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', User);