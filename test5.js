const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "restaurant_saas" });
  
  const Cart = mongoose.connection.collection('carts');
  const cart = await Cart.findOne({ _id: new mongoose.Types.ObjectId('6aab9951a5adf39e35612bbd') });

  const OfferService = require('./lib/services/offer.service.ts');
  console.log("OfferService exists");
  
  process.exit(0);
}

run();
