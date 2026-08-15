"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length <= 1) {
      return undefined;
    }
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % images.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [images.length]);

  const current = images[active] ?? images[0];

  return (
    <>
      {images.length > 1 ? (
        <div className="product-thumbs">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              className={`product-thumb${active === index ? " product-thumb-active" : ""}`}
            >
              <Image src={image} alt={`View ${index + 1}`} width={72} height={96} className="product-thumb-image object-cover" />
            </button>
          ))}
        </div>
      ) : null}
      <div className={`product-main-image${images.length <= 1 ? " product-main-image--solo" : ""}`}>
        {current ? <Image src={current} alt={title} fill className="object-cover" sizes="50vw" priority /> : null}
      </div>
    </>
  );
}
