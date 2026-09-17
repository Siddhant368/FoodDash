const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "restaurant_saas" });
  
  const Cart = mongoose.connection.collection('carts');
  const cart = await Cart.findOne({});
  console.log("Cart items:", cart.items);

  const Offer = mongoose.connection.collection('offers');
  const offers = await Offer.find({}).toArray();
  console.log("Offers:", offers);
  
  process.exit(0);
}

run();
