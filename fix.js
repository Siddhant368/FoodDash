const fs = require('fs');
const path = require('path');

const files = [
  'app/api/admin/delivery/partners/route.ts',
  'app/api/admin/menu/route.ts',
  'app/api/super-admin/restaurants/route.ts'
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // replace await Model.create({ with (await Model.create({ ... }) as any)
  // But regex is tricky for this.
  // Let's just find "await User.create({" and replace it.
  content = content.replace(/await\s+User\.create\s*\(/g, '(await User.create(');
  content = content.replace(/await\s+MenuItem\.create\s*\(/g, '(await MenuItem.create(');
  content = content.replace(/await\s+Restaurant\.create\s*\(/g, '(await Restaurant.create(');
  
  // Actually, I can just replace `restaurantId: user.restaurantId` with `restaurantId: user.restaurantId as any`
  content = content.replace(/restaurantId:\s*user\.restaurantId/g, 'restaurantId: user.restaurantId as any');
  
  fs.writeFileSync(filePath, content);
}
console.log("Done");
