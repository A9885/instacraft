import ProductCard from './ProductCard';

export default function RelatedProducts({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="section-sm" aria-labelledby="related-heading">
      <div className="section-header" style={{ textAlign: 'left' }}>
        <span className="overline">Discover More</span>
        <h2 id="related-heading" className="heading-md">Related Products</h2>
      </div>
      <div className="grid grid-auto-md">
        {products.map(p => (
          <ProductCard key={p._id || p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
