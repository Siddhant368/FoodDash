const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const moment = require('moment-timezone');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "restaurant_saas" });
  
  const Offer = mongoose.connection.collection('offers');
  const offer = await Offer.findOne({});
  
  console.log("Offer:", offer.code);

  const now = moment().tz("Asia/Kolkata");
  const startDate = moment(offer.startDate).tz("Asia/Kolkata").startOf("day");
  const endDate = moment(offer.endDate).tz("Asia/Kolkata").endOf("day");
  
  console.log("Now:", now.format());
  console.log("StartDate:", startDate.format());
  console.log("EndDate:", endDate.format());
  
  if (now.isBefore(startDate)) {
    console.log("Error: not started");
  } else if (now.isAfter(endDate)) {
    console.log("Error: expired");
  } else {
    console.log("Dates are valid!");
  }
  
  process.exit(0);
}

run();
