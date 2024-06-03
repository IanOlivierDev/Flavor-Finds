const express = require('express');
const app = express();

const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
const path = require('path');
app.set('views', path.join(__dirname, 'views'))

const mongoose = require('mongoose');
const methodOverride = require('method-override');

//Models
const Restaurants = require('./models/restaurant');
const Reviews = require('./models/reviews');
const User = require('./models/user');

//Routes
const userRoutes = require('./routes/auth');


//Middleware
const {isLoggedIn} = require('./middlewear/middleware');
//Passport
const passport = require('passport');
const LocalStrategy = require('passport-local');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

//Pexels image API
const { createClient } = require('pexels');
const client = createClient('E2QAFjO6WPuF3iueYOjA7LlAGpnmIpbee23x2oWfHeZUjV0qn0k1V3ZI');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

//Express-Session
const session = require("express-session");
const config = {
    secret: "flavorfinds",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60,
        maxAge: 1000 * 60 * 60
    }
}
app.use(session(config));


//Passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Connect-Flash
const flash = require('connect-flash');
const { log } = require('console');
const restaurant = require('./models/restaurant');
app.use(flash());

app.use((req, res, next) =>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

//Routes
app.use('/', userRoutes);

//Database connection
async function connect() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/flavorfinds');
        console.log("Connected to DB");
    } catch (error) {
        console.log(error.message);
    }
}
connect();


//Routes
// Route to search for photos using Pexels API
app.get('/search-photos', async (req, res) => {
    try {
        const {query = 'restaurants'} = req.query;
        const response = await client.photos.search({query, per_page: 10});
        const photos = response.photos.map(photo => photo.src.medium);
        const alt = response.photos.map(photo => photo.photographer);
        // res.send(photos);
        res.render('images', {photos, alt});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//Passport
app.get('/fake', async(req, res) =>{
    try {
        const user = new User({
            email: 'example@example.com',
            username: 'example'         
        });
        const registeredUser = await User.register(user, 'passwordExample');
        res.send(registeredUser);
    } catch (error) {
        res.send(error.message);
    }
});

app.get('/', async (req, res) =>{
    try {
        const restaurants = await Restaurants.find({}).sort({_id: -1});
        res.render('homepage', {restaurants});
    } catch (error) {
        res.send(error.message);
    }
});

app.get('/new', isLoggedIn, (req, res) =>{
    // try {
    //     if (req.isAuthenticated()){
    //         res.render('new');
    //     } else{
    //         req.flash('error', `Please Login First!`);
    //         res.redirect('/login');
    //     }
    // } catch (error) {
    //     req.flash('error', `${error.message}`);
    //     res.redirect('/');
    // }

    res.render('new');
});

app.post('/', async(req, res) => {
    try {
        const data = req.body;
        const newEntry = new Restaurants(data);
        newEntry.author = req.user.id;
        await newEntry.save();
        req.flash('success', 'Added a new Restaurant Review!');
        res.redirect(`/${newEntry._id}`);
    } catch (error) {
        res.send(error.message);
    }
});

app.get('/:id', async(req, res) =>{
    try {
        const {id} = req.params;
        const restaurant = await Restaurants.findById(id).populate('reviews').populate('author');
        res.render('details', {restaurant});
    } catch (error) {
        res.send(error.message);
    }
});

app.delete('/:id', isLoggedIn, async(req, res) =>{
    try {
        const {id} = req.params;
        await Restaurants.findByIdAndDelete(id);
        req.flash('success', 'Entry Deleted');
        res.redirect('/');
    } catch (error) {
        res.send(error.message);
    }
});

app.get('/:id/edit', isLoggedIn, async(req, res) =>{
    try {
        const {id} = req.params;
        const restaurant = await Restaurants.findById(id);
        if (!restaurant.author.equals(req.user._id)){
            req.flash('error', 'Incorrect Permissions');
            return res.redirect(`/${id}`);
        }
        res.render('edit', {restaurant});
    } catch (error) {
        res.send(error.message);
    }
});

app.put('/:id', async(req, res) =>{
    try {
        const {id} = req.params;
        const  restaurant = await Restaurants.findByIdAndUpdate(id, {...req.body.restaurant}, {new: true});
        req.flash('success', 'Success');
        res.redirect(`/${restaurant.id}`);
    } catch (error) {
        res.send(error.message);
    }
});


app.post('/:id/reviews',isLoggedIn, async(req, res) => {
    try {
        const {id} = req.params;
        const restaurant = await Restaurants.findById(id);
        const review = new Reviews(req.body.review);
        //Push review form data into the reviews array in the reviews model
        review.author = req.user.id;
        restaurant.reviews.push(review);
        await review.save();
        await restaurant.save();
        res.redirect(`/${id}`);
    } catch (error) {
        res.send(error.message);
    }
});

app.delete('/:id/reviews/:reviewID', isLoggedIn, async(req, res) =>{
    try {
        const {id, reviewID} = req.params;
        //Find entry by ID and and update the reviews colletion by removing the specified reviewID
        await Restaurants.findByIdAndUpdate(id, {$pull: {reviewID}});
        await Reviews.findByIdAndDelete(reviewID);
        res.redirect(`/${id}`);
    } catch (error) {
        res.send(error.message);
    }
});

app.listen(9000, (req, res) =>{
    console.log("9000: Active");
});