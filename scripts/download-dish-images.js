const fs = require('fs');
const path = require('path');
const https = require('https');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const mongoose = require('mongoose');

const dir = path.join(process.cwd(), 'public', 'images', 'foods');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const dishes = [
  { name: 'Paneer Tikka', slug: 'paneer-tikka', url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80' },
  { name: 'Hara Bhara Kabab', slug: 'hara-bhara-kabab', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80' },
  { name: 'Chicken Tikka', slug: 'chicken-tikka', url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80' },
  { name: 'Dal Makhani', slug: 'dal-makhani', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80' },
  { name: 'Paneer Butter Masala', slug: 'paneer-butter-masala', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80' },
  { name: 'Kadhai Paneer', slug: 'kadhai-paneer', url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80' },
  { name: 'Butter Chicken', slug: 'butter-chicken', url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80' },
  { name: 'Butter Naan', slug: 'butter-naan', url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80' },
  { name: 'Garlic Naan', slug: 'garlic-naan', url: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=800&auto=format&fit=crop&q=80' },
  { name: 'Jeera Rice', slug: 'jeera-rice', url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&auto=format&fit=crop&q=80' },
  { name: 'Veg Biryani', slug: 'veg-biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80' },
  { name: 'Chicken Biryani', slug: 'chicken-biryani', url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&auto=format&fit=crop&q=80' },
  { name: 'Gulab Jamun', slug: 'gulab-jamun', url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=80' },
  { name: 'Rasmalai', slug: 'rasmalai', url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&auto=format&fit=crop&q=80' },
  { name: 'Laal Maas', slug: 'laal-maas', url: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=800&auto=format&fit=crop&q=80' },
  { name: 'Gatte Ki Sabzi', slug: 'gatte-ki-sabzi', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80' },
  { name: 'Dal Baati Churma', slug: 'dal-baati-churma', url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80' },
  { name: 'Masala Dosa', slug: 'masala-dosa', url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80' },
  { name: 'Idli Sambar', slug: 'idli-sambar', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80' },
  { name: 'Pani Puri', slug: 'pani-puri', url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&auto=format&fit=crop&q=80' },
  { name: 'Samosa Chaat', slug: 'samosa-chaat', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80' },
  { name: 'Rajasthani Thali', slug: 'rajasthani-thali', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80' },
  { name: 'Margherita Pizza', slug: 'margherita-pizza', url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80' },
  { name: 'Veg Pasta', slug: 'veg-pasta', url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80' }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Status: ' + res.statusCode));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Downloading 24 dish images...');
  for (const item of dishes) {
    const dest = path.join(dir, item.slug + '.jpg');
    try {
      await download(item.url, dest);
      console.log('✓ Downloaded:', item.name);
    } catch (e) {
      console.error('✗ Failed:', item.name, e.message);
    }
  }

  console.log('\nConnecting to MongoDB to update menu items...');
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'restaurant_saas' });
  const collection = mongoose.connection.collection('menuitems');

  let totalUpdated = 0;
  for (const item of dishes) {
    const imgPath = `/images/foods/${item.slug}.jpg`;
    const res = await collection.updateMany(
      { name: item.name },
      { $set: { image: imgPath } }
    );
    totalUpdated += res.modifiedCount;
    console.log(`Updated "${item.name}": matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  }

  console.log(`\nAll done! Total menu item records updated: ${totalUpdated}`);
  await mongoose.disconnect();
}

main().catch(console.error);
