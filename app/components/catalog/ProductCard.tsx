'use client';
import { useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/catalog/types';
import Icon from './Icon';
const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});
export default function ProductCard({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  return (
    <article className="catalog-product">
      <div className="catalog-product-picture">
        {product.image && !failed ? (
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={400}
            unoptimized
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="catalog-image-placeholder">
            <Icon name="bag" size={38} />
            <span>Sem imagem</span>
          </div>
        )}
        {product.storeLogo && !logoFailed && (
          <Image
            className="catalog-store-logo"
            src={product.storeLogo}
            alt={product.storeName ? `Loja ${product.storeName}` : 'Loja'}
            width={66}
            height={66}
            unoptimized
            onError={() => setLogoFailed(true)}
          />
        )}
      </div>
      <h3>{product.name}</h3>
      <p className="catalog-price">{currency.format(product.price)}</p>
      <p
        className={`catalog-stock ${product.stock > 0 ? 'available' : 'unavailable'}`}
      >
        {product.stock > 0 ? 'DISPONÍVEL' : 'INDISPONÍVEL'}
      </p>
      {product.storeName && (
        <span className="catalog-sr-only">Vendido por {product.storeName}</span>
      )}
    </article>
  );
}
