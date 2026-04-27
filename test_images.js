const fs = require('fs');
const glob = require('glob');

async function run() {
  const images = new Set();
  const fileToImages = {};
  
  // A crude regex to find Unsplash image urls
  const regex = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+[^\"\'\s]+/g;
  
  const files = [
    'src/data/products.js',
    'src/data/offers.js',
    'src/data/customers.js',
    'src/data/categories.js',
    'src/app/(store)/page.jsx',
    'src/app/(store)/about/page.jsx',
  ];

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(regex);
    if (matches) {
      fileToImages[file] = matches;
      matches.forEach(m => images.add(m));
    }
  }

  console.log('Total unique images found:', images.size);
  let brokenCount = 0;
  for (const url of images) {
    try {
      const res = await fetch(url.split('?')[0]); 
      if (!res.ok) {
        console.log('BROKEN:', url);
        brokenCount++;
      } else {
        console.log('OK:', url);
      }
    } catch (e) {
      console.log('ERROR Fetching:', url);
    }
  }
  console.log('Total broken images:', brokenCount);
}
run();
