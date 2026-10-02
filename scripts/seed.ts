import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import Restaurant from "@/models/Restaurant";
import User from "@/models/User";
import Category from "@/models/Category";
import MenuItem from "@/models/MenuItem";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

const restaurantsData = [
  {
    name: "FoodHub Royal Kitchen",
    slug: "foodhub-royal-kitchen",
    description: "Experience the royal taste of India.",
    phone: "+91 9000000001",
    email: "contact@royal-kitchen.com",
    address: { street: "Palace Road", city: "Udaipur", state: "Rajasthan", pincode: "313001", country: "India" }
  },
  {
    name: "Udaipur Spice House",
    slug: "udaipur-spice-house",
    description: "Authentic spices from the city of lakes.",
    phone: "+91 9000000002",
    email: "contact@udaipur-spice.com",
    address: { street: "Lake Pichola", city: "Udaipur", state: "Rajasthan", pincode: "313001", country: "India" }
  },
  {
    name: "Rajasthan Rasoi",
    slug: "rajasthan-rasoi",
    description: "Traditional Rajasthani thali and more.",
    phone: "+91 9000000003",
    email: "contact@rajasthan-rasoi.com",
    address: { street: "MI Road", city: "Jaipur", state: "Rajasthan", pincode: "302001", country: "India" }
  },
  {
    name: "The Tandoor Story",
    slug: "the-tandoor-story",
    description: "Best tandoori dishes in town.",
    phone: "+91 9000000004",
    email: "contact@tandoor-story.com",
    address: { street: "Vaishali Nagar", city: "Jaipur", state: "Rajasthan", pincode: "302021", country: "India" }
  },
  {
    name: "Urban Bites",
    slug: "urban-bites",
    description: "Modern Indian fusion food.",
    phone: "+91 9000000005",
    email: "contact@urban-bites.com",
    address: { street: "C Scheme", city: "Jaipur", state: "Rajasthan", pincode: "302001", country: "India" }
  },
  {
    name: "The Punjabi Table",
    slug: "the-punjabi-table",
    description: "Hearty Punjabi meals.",
    phone: "+91 9000000006",
    email: "contact@punjabi-table.com",
    address: { street: "Raja Park", city: "Jaipur", state: "Rajasthan", pincode: "302004", country: "India" }
  },
  {
    name: "South Indian Junction",
    slug: "south-indian-junction",
    description: "Authentic South Indian delicacies.",
    phone: "+91 9000000007",
    email: "contact@south-indian-junction.com",
    address: { street: "Bapu Bazaar", city: "Jaipur", state: "Rajasthan", pincode: "302003", country: "India" }
  },
  {
    name: "Desi Zaika",
    slug: "desi-zaika",
    description: "Street food style Indian curries.",
    phone: "+91 9000000008",
    email: "contact@desi-zaika.com",
    address: { street: "Fateh Sagar", city: "Udaipur", state: "Rajasthan", pincode: "313001", country: "India" }
  },
  {
    name: "The Biryani House",
    slug: "the-biryani-house",
    description: "Aromatic and flavorful biryanis.",
    phone: "+91 9000000009",
    email: "contact@biryani-house.com",
    address: { street: "Hiran Magri", city: "Udaipur", state: "Rajasthan", pincode: "313002", country: "India" }
  },
  {
    name: "Green Leaf Cafe",
    slug: "green-leaf-cafe",
    description: "Pure vegetarian delights.",
    phone: "+91 9000000010",
    email: "contact@green-leaf.com",
    address: { street: "Saheli Marg", city: "Udaipur", state: "Rajasthan", pincode: "313001", country: "India" }
  },
  {
    name: "Jaipur Food Corner",
    slug: "jaipur-food-corner",
    description: "All your favorite Jaipur street foods.",
    phone: "+91 9000000011",
    email: "contact@jaipur-food.com",
    address: { street: "Johari Bazaar", city: "Jaipur", state: "Rajasthan", pincode: "302003", country: "India" }
  },
  {
    name: "The Curry Bowl",
    slug: "the-curry-bowl",
    description: "Rich and creamy curries.",
    phone: "+91 9000000012",
    email: "contact@curry-bowl.com",
    address: { street: "Malviya Nagar", city: "Jaipur", state: "Rajasthan", pincode: "302017", country: "India" }
  },
  {
    name: "Street Food Station",
    slug: "street-food-station",
    description: "Chaat, samosas, and more.",
    phone: "+91 9000000013",
    email: "contact@street-food.com",
    address: { street: "Chetak Circle", city: "Udaipur", state: "Rajasthan", pincode: "313001", country: "India" }
  },
  {
    name: "Taste of India",
    slug: "taste-of-india",
    description: "Pan-Indian cuisine under one roof.",
    phone: "+91 9000000014",
    email: "contact@taste-of-india.com",
    address: { street: "Mansarovar", city: "Jaipur", state: "Rajasthan", pincode: "302020", country: "India" }
  },
  {
    name: "Lake City Kitchen",
    slug: "lake-city-kitchen",
    description: "Dine with the view of the lakes.",
    phone: "+91 9000000015",
    email: "contact@lake-city.com",
    address: { street: "Ambrai Ghat", city: "Udaipur", state: "Rajasthan", pincode: "313001", country: "India" }
  }
];

const menuDataTemplate = [
  { cat: "Starters", name: "Paneer Tikka", price: 249, isVeg: true },
  { cat: "Starters", name: "Hara Bhara Kabab", price: 199, isVeg: true },
  { cat: "Starters", name: "Chicken Tikka", price: 299, isVeg: false },
  { cat: "Main Course", name: "Dal Makhani", price: 199, isVeg: true },
  { cat: "Main Course", name: "Paneer Butter Masala", price: 259, isVeg: true },
  { cat: "Main Course", name: "Kadhai Paneer", price: 249, isVeg: true },
  { cat: "Main Course", name: "Butter Chicken", price: 349, isVeg: false },
  { cat: "Breads", name: "Butter Naan", price: 49, isVeg: true },
  { cat: "Breads", name: "Garlic Naan", price: 59, isVeg: true },
  { cat: "Rice", name: "Jeera Rice", price: 129, isVeg: true },
  { cat: "Biryani", name: "Veg Biryani", price: 229, isVeg: true },
  { cat: "Biryani", name: "Chicken Biryani", price: 299, isVeg: false },
  { cat: "Dessert", name: "Gulab Jamun", price: 99, isVeg: true },
  { cat: "Dessert", name: "Rasmalai", price: 129, isVeg: true }
];

function generateUniqueMenu(index: number, restaurantName: string) {
  const menu = [...menuDataTemplate];
  
  if (index % 3 === 0) {
    menu.push({ cat: "Special", name: "Laal Maas", price: 399, isVeg: false });
    menu.push({ cat: "Special", name: "Gatte Ki Sabzi", price: 219, isVeg: true });
    menu.push({ cat: "Special", name: "Dal Baati Churma", price: 299, isVeg: true });
  } else if (index % 3 === 1) {
    menu.push({ cat: "South Indian", name: "Masala Dosa", price: 149, isVeg: true });
    menu.push({ cat: "South Indian", name: "Idli Sambar", price: 119, isVeg: true });
  } else {
    menu.push({ cat: "Street Food", name: "Pani Puri", price: 79, isVeg: true });
    menu.push({ cat: "Street Food", name: "Samosa Chaat", price: 99, isVeg: true });
  }
  
  return menu.map(item => ({
    ...item,
    price: item.price + (index * 5)
  }));
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI as string, {
      dbName: "restaurant_saas",
    });
    console.log("MongoDB connected");

    const hashedPassword = await bcrypt.hash("FoodHub@12345", 12);

    let restaurantsCreated = 0;
    let adminsCreated = 0;
    let categoriesCreated = 0;
    let menuItemsCreated = 0;

    for (let i = 0; i < restaurantsData.length; i++) {
      const restData = restaurantsData[i];
      
      const restaurant = await Restaurant.findOneAndUpdate(
        { slug: restData.slug },
        { ...restData, isOpen: true, isActive: true },
        { upsert: true, new: true }
      );
      restaurantsCreated++;

      const adminEmail = `admin.restaurant${(i + 1).toString().padStart(2, "0")}@foodhubdemo.com`;
      await User.findOneAndUpdate(
        { email: adminEmail },
        {
          name: `${restData.name} Admin`,
          password: hashedPassword,
          role: "RESTAURANT_ADMIN",
          restaurantId: restaurant._id,
          isActive: true
        },
        { upsert: true, new: true }
      );
      adminsCreated++;

      const menuData = generateUniqueMenu(i, restData.name);
      
      const categoryNames = Array.from(new Set(menuData.map(m => m.cat)));
      const categoryMap = new Map();
      
      for (const catName of categoryNames) {
        const slug = catName.toLowerCase().replace(/\s+/g, '-');
        const category = await Category.findOneAndUpdate(
          { restaurantId: restaurant._id, slug },
          { name: catName, isActive: true, sortOrder: 1 },
          { upsert: true, new: true }
        );
        categoryMap.set(catName, category._id);
        categoriesCreated++;
      }

      for (const item of menuData) {
        const slug = item.name.toLowerCase().replace(/\s+/g, '-');
        await MenuItem.findOneAndUpdate(
          { restaurantId: restaurant._id, slug },
          {
            categoryId: categoryMap.get(item.cat),
            name: item.name,
            description: `Delicious ${item.name} at ${restData.name}`,
            price: item.price,
            isVeg: item.isVeg,
            isAvailable: true,
            isFeatured: false,
            preparationTime: 20
          },
          { upsert: true, new: true }
        );
        menuItemsCreated++;
      }
      
      console.log(`Seeded Restaurant: ${restData.name}`);
    }

    // Keep the existing seed logic for Super Admin so we don't break things
    const superAdminEmail = "superadmin@foodhub.com";
    const superAdminPassword = await bcrypt.hash("SuperAdmin@12345", 12);
    await User.findOneAndUpdate(
      { email: superAdminEmail },
      {
        name: "Super Admin",
        password: superAdminPassword,
        role: "SUPER_ADMIN",
        restaurantId: undefined,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    console.log("\n================================");
    console.log("DATABASE SEEDED SUCCESSFULLY");
    console.log("================================");
    console.log(`Restaurants Created/Updated: ${restaurantsCreated}`);
    console.log(`Admins Created/Updated: ${adminsCreated}`);
    console.log(`Categories Created/Updated: ${categoriesCreated}`);
    console.log(`Menu Items Created/Updated: ${menuItemsCreated}`);
    console.log("--------------------------------");
    console.log("Admin Email Pattern: admin.restaurant01@foodhubdemo.com to admin.restaurant15@foodhubdemo.com");
    console.log("Admin Password: FoodHub@12345");
    console.log("================================\n");
    
  } catch (error) {
    console.error("Seed Error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();