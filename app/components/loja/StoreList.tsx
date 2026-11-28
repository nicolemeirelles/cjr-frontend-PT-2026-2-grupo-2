"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/app/components/catalog/Icon";
import SearchBar from "@/app/components/catalog/SearchBar";
import type { StoreSummary } from "@/lib/store";
import type { StoreCategory } from "./StoreModal";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLocaleLowerCase("pt-BR");
}

export default function StoreList({
  stores,
  categories,
  initialQuery,
}: {
  stores: StoreSummary[];
  categories: StoreCategory[];
  initialQuery: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState("");

  const term = normalize(query.trim());
  const filtered = stores.filter(
    (store) =>
      (!categoryId || store.categoryId === Number(categoryId)) &&
      (!term || normalize(store.name).includes(term)),
  );

  return (
    <section className="catalog-content" aria-labelledby="stores-title">
      <SearchBar query={query} onChange={setQuery} />
      <div className="stores-heading">
        <h2 id="stores-title">Lojas</h2>
        <label className="catalog-sort">
          <span className="catalog-sr-only">Filtrar lojas por categoria</span>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="">filtros</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <Icon name="chevron" size={20} />
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="catalog-message" role="status">
          <h2>Nenhuma loja encontrada</h2>
          <p>
            {stores.length === 0
              ? "As lojas aparecerão aqui quando forem cadastradas."
              : "Tente outro nome ou outra categoria."}
          </p>
        </div>
      ) : (
        <ul className="stores-grid">
          {filtered.map((store) => (
            <li key={store.id}>
              <Link href={`/lojas/${store.id}`} className="stores-item">
                <Image
                  className="stores-logo"
                  src={store.logoUrl}
                  alt=""
                  width={120}
                  height={120}
                  unoptimized
                />
                <span className="stores-name">{store.name}</span>
                <span className="stores-category">{store.categoryName}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
