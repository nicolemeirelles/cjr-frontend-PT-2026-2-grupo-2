'use client';
import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[]; 
  productName: string;
  storeName: string;
  storeLogo: string | null;
}

export default function ProductGallery({ images, productName, storeName, storeLogo }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const mainImage = images[selected] ?? images[0];

  return (
    <div className="product-gallery">
      {}
      {images.length > 1 && (
        <ul className="product-gallery__thumbs" aria-label="Fotos do produto">
          {images.map((url, index) => (
            <li key={url}>
              <button
                type="button"
                className="product-gallery__thumb"
                aria-label={`Ver foto ${index + 1} de ${images.length}`}
                aria-pressed={index === selected}
                onClick={() => setSelected(index)}
              >
                <Image src={url} alt="" width={107} height={107} unoptimized />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="product-gallery__main">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={productName}
            width={450}
            height={450}
            className="product-gallery__main-img"
            unoptimized
            priority
          />
        ) : (
          <p className="product-gallery__empty">Produto sem foto</p>
        )}

        {}
        {(storeLogo || storeName) && (
          <span className="product-gallery__store" title={storeName}>
            {storeLogo ? (
              <Image src={storeLogo} alt={`Logo da loja ${storeName}`} width={58} height={58} unoptimized />
            ) : (
              <span aria-label={`Loja ${storeName}`}>{storeName.slice(0, 3).toUpperCase()}</span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}