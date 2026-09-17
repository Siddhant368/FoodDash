const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "restaurant_saas" });
  
  const Cart = mongoose.connection.collection('carts');
  const cart = await Cart.findOne({});

  const MenuItem = mongoose.connection.collection('menuitems');
  const itemIds = cart.items.map(item => item.menuItemId);
  const items = await MenuItem.find({ _id: { $in: itemIds } }).toArray();
  
  console.log("Cart items:", cart.items);
  console.log("Menu items found:", items.map(i => ({ name: i.name, price: i.price })));

  let totalSubtotal = 0;
  cart.items.forEach(cartItem => {
    const menuItem = items.find(m => m._id.toString() === cartItem.menuItemId.toString());
    if (menuItem) {
      totalSubtotal += menuItem.price * cartItem.quantity;
    }
  });

  console.log("Total Subtotal:", totalSubtotal);
  
  process.exit(0);
}

run();
