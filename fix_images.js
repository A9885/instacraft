const fs = require('fs');

const goodImages = [
  'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80',
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
  'https://images.unsplash.com/photo-1599320669176-ff158a5c4f24?w=800&q=80',
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
  'https://images.unsplash.com/photo-1508599589920-14cfa1d1ac0a?w=800&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  'https://images.unsplash.com/photo-1583301286816-f4f03901b046?w=800&q=80',
  'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80',
  'https://images.unsplash.com/photo-1601614769062-817342fb6f61?w=800&q=80',
  'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80',
  'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800&q=80',
  'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
  'https://images.unsplash.com/photo-1581783898377-1c85bf933333?w=800&q=80',
  'https://images.unsplash.com/photo-1511520668010-0112391090cb?w=800&q=80',
  'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80',
  'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80',
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80'
];

const files = [
  'src/data/products.js',
  'src/data/offers.js',
  'src/data/customers.js',
  'src/data/categories.js',
  'src/app/(store)/page.jsx',
  'src/app/(store)/about/page.jsx',
];

const regex = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+[^\"\'\s\\]+/g;

let imgIndex = 0;
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  content = content.replace(regex, (match) => {
    changed = true;
    const replacement = goodImages[imgIndex % goodImages.length];
    imgIndex++;
    return replacement;
  });
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated images in ${file}`);
  }
}
console.log('Done!');
