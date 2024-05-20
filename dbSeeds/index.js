const mongoose = require('mongoose');
const cities = require('./cities');
const {restaurantNames} = require('./names');
const RestaurantCollection = require('../models/restaurant');

const { createClient } = require('pexels');
const client = createClient('E2QAFjO6WPuF3iueYOjA7LlAGpnmIpbee23x2oWfHeZUjV0qn0k1V3ZI');

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
        let randLocation; 

        const response = await client.photos.search({query: 'restaurants', per_page: 50});
        const photos = response.photos.map(photo => photo.src.medium);
        const alt = response.photos.map(photo => photo.photographer);

        for (let name of restaurantNames){
            let randNum = Math.floor(Math.random() * 50) + 1;
            let randPrice = Math.floor(Math.random() * 50 + 1);
            randLocation = cities[randNum].city;
            const seed = new RestaurantCollection({
                name: `${name}`,
                image: photos[randNum],
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


