const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  // 1. Clear existing data
  await Listing.deleteMany({});

  // 2. Fix the data structure
  // We map over the data to change 'image' from an Object to a String (URL)
  const convertedData = initData.data.map((obj) => ({
    ...obj,
    image: obj.image.url, 
  }));

  // 3. Insert the fixed data
  await Listing.insertMany(convertedData);
  
  console.log("data was initialized");
};

initDB();