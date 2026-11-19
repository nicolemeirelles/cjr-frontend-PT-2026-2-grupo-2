'use client';

import { useRouter } from 'next/navigation';
import Icon from './Icon';

type Props = {
  query: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ query, onChange }: Props) {
  const router = useRouter();

  function updateUrl(value: string) {
    const url = new URL(window.location.href);
    const term = value.trim();
    if (term) url.searchParams.set('q', term);
    else url.searchParams.delete('q');
    router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
  }

  function clear() {
    onChange('');
    updateUrl('');
  }

  return (
    <form className="catalog-search" role="search" onSubmit={(event) => {
      event.preventDefault();
      updateUrl(query);
    }}>
      <label htmlFor="catalog-search" className="catalog-sr-only">
        Buscar produtos e lojas
      </label>
      <input
        id="catalog-search"
        name="q"
        type="search"
        placeholder="Procurar por…"
        value={query}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') clear();
        }}
      />
      {query && (
        <button type="button" aria-label="Limpar pesquisa" onClick={clear}>
          <span aria-hidden="true">×</span>
        </button>
      )}
      <button type="submit" aria-label="Buscar">
        <Icon name="search" size={21} />
      </button>
    </form>
  );
}
