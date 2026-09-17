const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = path.join(__dirname, 'public', 'images', 'foods');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const images = {
  'margherita-pizza.webp': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
  'farmhouse-pizza.webp': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
  'veg-burger.webp': 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&q=80',
  'chicken-biryani.webp': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
  'veg-biryani.webp': 'https://images.unsplash.com/photo-1589302168068-964664d93cb0?w=800&q=80',
  'chocolate-brownie.webp': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80',
  'cold-coffee.webp': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80'
};

Object.entries(images).forEach(([filename, url]) => {
  const filePath = path.join(dir, filename);
  https.get(url, (res) => {
    // Unsplash sometimes redirects, handle basic 302s if needed, or just pipe
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      https.get(res.headers.location, (redirectRes) => {
        const fileStream = fs.createWriteStream(filePath);
        redirectRes.pipe(fileStream);
      });
    } else {
      const fileStream = fs.createWriteStream(filePath);
      res.pipe(fileStream);
    }
  });
});

// Also create a placeholder for the fallback
https.get('https://images.unsplash.com/photo-1495195134817-a165d42e6505?w=800&q=80', (res) => {
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    https.get(res.headers.location, (redirectRes) => {
      redirectRes.pipe(fs.createWriteStream(path.join(__dirname, 'public', 'placeholder-food.jpg')));
    });
  } else {
    res.pipe(fs.createWriteStream(path.join(__dirname, 'public', 'placeholder-food.jpg')));
  }
});

console.log('Downloading images...');
