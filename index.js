const express = require('express');
const app = express();

const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
const path = require('path');
app.set('views', path.join(__dirname, 'views'))

const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Restaurants = require('./models/restaurant');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

async function connect() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/flavorfinds');
        console.log("Connected to DB");
    } catch (error) {
        console.log(error.message);
    }
}
connect();


app.get('/', async (req, res) =>{
    try {
        const restaurants = await Restaurants.find({}).sort({_id: -1});
        res.render('homepage', {restaurants});
    } catch (error) {
        res.send(error.message);
    }
});

app.get('/new', (req, res) =>{
    try {
        res.render('new');
    } catch (error) {
        res.send(error.message);
    }
});

app.post('/', async(req, res) => {
    try {
        const data = req.body;
        const newEntry = new Restaurants(data);
        await newEntry.save();
        res.redirect('/');
    } catch (error) {
        res.send(error.message);
    }
});

app.get('/:id', async(req, res) =>{
    try {
        const {id} = req.params;
        const restaurant = await Restaurants.findById(id);
        res.render('details', {restaurant});
    } catch (error) {
        res.send(error.message);
    }
});

app.delete('/:id', async(req, res) =>{
    try {
        const {id} = req.params;
        await Restaurants.findByIdAndDelete(id);
        res.redirect('/');
    } catch (error) {
        res.send(error.message);
    }
});

app.listen(9000, (req, res) =>{
    console.log("9000: Active");
});