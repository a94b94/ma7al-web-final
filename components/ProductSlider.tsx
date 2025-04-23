import { useKeenSlider } from "keen-slider/react";
import ProductCard from "./ProductCard";

export default function ProductSlider({ products }: { products: any[] }) {
  const [sliderRef] = useKeenSlider({ mode: "free", slides: { perView: "auto", spacing: 12 } });
  return (
    <div ref={sliderRef} className="keen-slider">
      {products.map((product) => (
        <div key={product._id} className="keen-slider__slide" style={{ width: "160px" }}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
