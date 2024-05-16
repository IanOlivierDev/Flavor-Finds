const mongoose = require('mongoose');
const cities = require('./cities');
const {restaurantNames} = require('./names');
const RestaurantCollection = require('../models/restaurant');

async function connect(){
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/flavorfinds');
        console.log("Connected to DB");
    } catch (error) {
        console.log(error.message);
    }
}
connect();

async function seedDB(){
    try {
        await RestaurantCollection.deleteMany({});
        let randNum = Math.floor(Math.random() * 50) + 1;
        const randPrice = Math.floor(Math.random() * 50 + 1);
        let randLocation; 

        for (let name of restaurantNames){
            randLocation = cities[randNum].city;
            const seed = new RestaurantCollection({
                name: `${name}`,
                image: '',
                price: randPrice,
                description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus voluptate expedita ratione quos voluptatum, aspernatur ad unde assumenda incidunt corporis ex quia provident. Quos dolores pariatur, explicabo enim assumenda sapiente.',
                location: randLocation
            });

            await seed.save();
        }

    } catch (error) {
        console.log(error.message);
    }
}
seedDB().then(() =>{
    mongoose.connection.close();
});


