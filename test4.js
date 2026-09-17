const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "restaurant_saas" });
  
  const Cart = mongoose.connection.collection('carts');
  const carts = await Cart.find({}).toArray();

  const MenuItem = mongoose.connection.collection('menuitems');
  const items = await MenuItem.find({}).toArray();
  
  console.log("Carts:", carts.length);
  console.log("Menu items in DB:", items.length);

  for (const cart of carts) {
    const itemIds = cart.items.map(item => item.menuItemId);
    const cartMenuItems = items.filter(i => itemIds.some(id => id.toString() === i._id.toString()));
    
    let totalSubtotal = 0;
    cart.items.forEach(cartItem => {
      const menuItem = cartMenuItems.find(m => m._id.toString() === cartItem.menuItemId.toString());
      if (menuItem) {
        totalSubtotal += menuItem.price * cartItem.quantity;
      }
    });

    console.log(`Cart ${cart._id} subtotal:`, totalSubtotal);
  }
  
  process.exit(0);
}

run();
