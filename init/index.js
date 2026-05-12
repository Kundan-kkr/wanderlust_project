const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");
const geocoder = require("../utils/geocoder.js");

const MONGO_URL=('mongodb://127.0.0.1:27017/Wanderlust');

main()
    .then(() => {
        console.log("Connected to DB!");
    })
    .catch((err) => {
        console.log(err);
    });

    async function main(){
        await mongoose.connect(MONGO_URL);
    }

    function delay(ms) { // Delay function using for mapping through the data and geocoding each location with a delay to avoid hitting the rate limit of the geocoding API
    return new Promise(resolve => setTimeout(resolve, ms));
}
   
    
const initDB = async () => {
        await Listing.deleteMany({});

        let updatedData = [];

        for(let obj of initData.data){

         //   console.log(obj.location);
        //  Geocode the location and add the geometry field to the object
            let response = await geocoder.geocode(obj.location);
            await delay(1000);
            obj.geometry = {
                type: "Point",
                coordinates: [
                    response[0].longitude,
                    response[0].latitude
                ],
            };

            obj.owner = "69f600850ecdd78bb7f93a75";

            updatedData.push(obj);
        }

    await Listing.insertMany(updatedData);
    //  console.log(updatedData);

    console.log("Data was initialized!");
};

initDB();
