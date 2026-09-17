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

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI as string, {
      dbName: "restaurant_saas",
    });

    console.log("MongoDB connected");

    // Clear development data
    await MenuItem.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    await Restaurant.deleteMany({});

    // Restaurant
    const restaurant = await Restaurant.create({
      name: "FoodHub Restaurant",
      slug: "foodhub-restaurant",
      description: "Fresh and delicious food made with love.",
      phone: "+91 9876543210",
      email: "hello@foodhub.com",
      address: {
        street: "Main Market",
        city: "Udaipur",
        state: "Rajasthan",
        pincode: "313001",
        country: "India",
      },
      isOpen: true,
      isActive: true,
    });

    console.log("Restaurant created");

    // Admin password
    const hashedPassword = await bcrypt.hash(
      "Admin@12345",
      12
    );

    // Restaurant Admin
    await User.create({
      name: "Restaurant Admin",
      email: "admin@foodhub.com",
      password: hashedPassword,
      role: "RESTAURANT_ADMIN",
      restaurantId: restaurant._id,
      isActive: true,
    });

    console.log("Admin created");

    // Delivery Partner password
    const deliveryPassword = await bcrypt.hash(
      "Delivery@12345",
      12
    );

    // Delivery Partner
    await User.create({
      name: "Delivery Partner",
      email: "delivery@foodhub.com",
      password: deliveryPassword,
      phone: "9876543211",
      role: "DELIVERY_PARTNER",
      restaurantId: restaurant._id,
      isActive: true,
    });

    console.log("Delivery Partner created");

    // ============================================================
    // SUPER ADMIN
    // ============================================================

    const superAdminPassword = await bcrypt.hash(
      "SuperAdmin@12345",
      12
    );

    await User.create({
      name: "Super Admin",
      email: "superadmin@foodhub.com",
      password: superAdminPassword,
      role: "SUPER_ADMIN",
      restaurantId: undefined,
      isActive: true,
    });

    console.log("Super Admin created");

    // Categories
    const categories = await Category.insertMany([
      {
        restaurantId: restaurant._id,
        name: "Pizza",
        slug: "pizza",
        sortOrder: 1,
        isActive: true,
      },
      {
        restaurantId: restaurant._id,
        name: "Burgers",
        slug: "burgers",
        sortOrder: 2,
        isActive: true,
      },
      {
        restaurantId: restaurant._id,
        name: "Biryani",
        slug: "biryani",
        sortOrder: 3,
        isActive: true,
      },
      {
        restaurantId: restaurant._id,
        name: "Desserts",
        slug: "desserts",
        sortOrder: 4,
        isActive: true,
      },
      {
        restaurantId: restaurant._id,
        name: "Beverages",
        slug: "beverages",
        sortOrder: 5,
        isActive: true,
      },
    ]);

    console.log(`${categories.length} categories created`);

    const pizzaCategory = categories.find(
      (category) => category.slug === "pizza"
    );

    const burgerCategory = categories.find(
      (category) => category.slug === "burgers"
    );

    const biryaniCategory = categories.find(
      (category) => category.slug === "biryani"
    );

    const dessertCategory = categories.find(
      (category) => category.slug === "desserts"
    );

    const beverageCategory = categories.find(
      (category) => category.slug === "beverages"
    );

    // Menu Items
    const menuItems = [
      {
        restaurantId: restaurant._id,
        categoryId: pizzaCategory!._id,
        name: "Margherita Pizza",
        slug: "margherita-pizza",
        description:
          "Classic pizza with tomato, mozzarella and basil.",
        price: 249,
        image: "/images/foods/margherita-pizza.webp",
        isVeg: true,
        isAvailable: true,
        isFeatured: true,
        preparationTime: 20,
      },
      {
        restaurantId: restaurant._id,
        categoryId: pizzaCategory!._id,
        name: "Farmhouse Pizza",
        slug: "farmhouse-pizza",
        description:
          "Loaded with fresh vegetables and mozzarella.",
        price: 349,
        image: "/images/foods/farmhouse-pizza.webp",
        isVeg: true,
        isAvailable: true,
        isFeatured: true,
        preparationTime: 25,
      },
      {
        restaurantId: restaurant._id,
        categoryId: burgerCategory!._id,
        name: "Classic Veg Burger",
        slug: "classic-veg-burger",
        description:
          "Crispy veg patty with fresh vegetables and sauce.",
        price: 179,
        image: "/images/foods/veg-burger.webp",
        isVeg: true,
        isAvailable: true,
        isFeatured: true,
        preparationTime: 15,
      },
      {
        restaurantId: restaurant._id,
        categoryId: biryaniCategory!._id,
        name: "Chicken Biryani",
        slug: "chicken-biryani",
        description:
          "Aromatic basmati rice with flavorful chicken.",
        price: 299,
        image: "/images/foods/chicken-biryani.webp",
        isVeg: false,
        isAvailable: true,
        isFeatured: true,
        preparationTime: 30,
      },
      {
        restaurantId: restaurant._id,
        categoryId: biryaniCategory!._id,
        name: "Veg Biryani",
        slug: "veg-biryani",
        description:
          "Fragrant basmati rice with fresh vegetables.",
        price: 229,
        image: "/images/foods/veg-biryani.webp",
        isVeg: true,
        isAvailable: true,
        isFeatured: false,
        preparationTime: 25,
      },
      {
        restaurantId: restaurant._id,
        categoryId: dessertCategory!._id,
        name: "Chocolate Brownie",
        slug: "chocolate-brownie",
        description:
          "Rich and soft chocolate brownie.",
        price: 149,
        image: "/images/foods/chocolate-brownie.webp",
        isVeg: true,
        isAvailable: true,
        isFeatured: true,
        preparationTime: 10,
      },
      {
        restaurantId: restaurant._id,
        categoryId: beverageCategory!._id,
        name: "Cold Coffee",
        slug: "cold-coffee",
        description: "Creamy chilled coffee.",
        price: 129,
        image: "/images/foods/cold-coffee.webp",
        isVeg: true,
        isAvailable: true,
        isFeatured: false,
        preparationTime: 5,
      },
    ];

    await MenuItem.insertMany(menuItems);

    console.log(`${menuItems.length} menu items created`);

    console.log("\n================================");
    console.log("DATABASE SEEDED SUCCESSFULLY");
    console.log("================================");
    console.log("Super Admin Email: superadmin@foodhub.com");
    console.log("Super Admin Password: SuperAdmin@12345");
    console.log("--------------------------------");
    console.log("Admin Email: admin@foodhub.com");
    console.log("Admin Password: Admin@12345");
    console.log("--------------------------------");
    console.log("Delivery Email: delivery@foodhub.com");
    console.log("Delivery Password: Delivery@12345");
    console.log("--------------------------------");
    console.log("Restaurant: FoodHub Restaurant");
    console.log("================================\n");
  } catch (error) {
    console.error("Seed Error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();