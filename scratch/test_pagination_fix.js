const { getProducts } = require('./src/lib/api');

async function test() {
  try {
    const products = await getProducts(false, 1, 10);
    console.log('Successfully fetched products:', products.length);
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}

test();
