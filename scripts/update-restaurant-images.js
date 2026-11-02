const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined");
  process.exit(1);
}

const updates = [
  {
    slug: "foodhub-royal-kitchen",
    logo: "/images/restaurants/logos/foodhub-royal-kitchen.svg",
    coverImage: "/images/restaurants/covers/foodhub-royal-kitchen.jpg"
  },
  {
    slug: "udaipur-spice-house",
    logo: "/images/restaurants/logos/udaipur-spice-house.svg",
    coverImage: "/images/restaurants/covers/udaipur-spice-house.jpg"
  },
  {
    slug: "rajasthan-rasoi",
    logo: "/images/restaurants/logos/rajasthan-rasoi.svg",
    coverImage: "/images/restaurants/covers/rajasthan-rasoi.jpg"
  },
  {
    slug: "the-tandoor-story",
    logo: "/images/restaurants/logos/the-tandoor-story.svg",
    coverImage: "/images/restaurants/covers/the-tandoor-story.jpg"
  },
  {
    slug: "urban-bites",
    logo: "/images/restaurants/logos/urban-bites.svg",
    coverImage: "/images/restaurants/covers/urban-bites.jpg"
  },
  {
    slug: "the-punjabi-table",
    logo: "/images/restaurants/logos/the-punjabi-table.svg",
    coverImage: "/images/restaurants/covers/the-punjabi-table.jpg"
  },
  {
    slug: "south-indian-junction",
    logo: "/images/restaurants/logos/south-indian-junction.svg",
    coverImage: "/images/restaurants/covers/south-indian-junction.jpg"
  },
  {
    slug: "desi-zaika",
    logo: "/images/restaurants/logos/desi-zaika.svg",
    coverImage: "/images/restaurants/covers/desi-zaika.jpg"
  },
  {
    slug: "the-biryani-house",
    logo: "/images/restaurants/logos/the-biryani-house.svg",
    coverImage: "/images/restaurants/covers/the-biryani-house.jpg"
  },
  {
    slug: "green-leaf-cafe",
    logo: "/images/restaurants/logos/green-leaf-cafe.svg",
    coverImage: "/images/restaurants/covers/green-leaf-cafe.jpg"
  },
  {
    slug: "jaipur-food-corner",
    logo: "/images/restaurants/logos/jaipur-food-corner.svg",
    coverImage: "/images/restaurants/covers/jaipur-food-corner.jpg"
  },
  {
    slug: "the-curry-bowl",
    logo: "/images/restaurants/logos/the-curry-bowl.svg",
    coverImage: "/images/restaurants/covers/the-curry-bowl.jpg"
  },
  {
    slug: "street-food-station",
    logo: "/images/restaurants/logos/street-food-station.svg",
    coverImage: "/images/restaurants/covers/street-food-station.jpg"
  },
  {
    slug: "taste-of-india",
    logo: "/images/restaurants/logos/taste-of-india.svg",
    coverImage: "/images/restaurants/covers/taste-of-india.jpg"
  },
  {
    slug: "lake-city-kitchen",
    logo: "/images/restaurants/logos/lake-city-kitchen.svg",
    coverImage: "/images/restaurants/covers/lake-city-kitchen.jpg"
  }
];

async function run() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: "restaurant_saas" });
    console.log("Connected to MongoDB");

    const collection = mongoose.connection.collection("restaurants");

    for (const item of updates) {
      const res = await collection.updateOne(
        { slug: item.slug },
        { $set: { logo: item.logo, coverImage: item.coverImage } }
      );
      console.log(`Updated ${item.slug}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
    }

    console.log("All 15 restaurants updated with new logo and coverImage successfully!");
  } catch (err) {
    console.error("Update failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

run();
