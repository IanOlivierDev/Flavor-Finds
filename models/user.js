const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        required: true,
        type: String,
        unique: true
    }
});

//Adds on username and password to the schema
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);