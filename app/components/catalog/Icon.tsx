type Props = {
  name: string;
  size?: number;
};
const paths: Record<string, string> = {
  search: 'm21 21-5-5 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  bag: 'M5 8h14l1 13H4L5 8 M8 8V6a4 4 0 0 1 8 0v2',
  store:
    'M3 9h18l-2-6H5L3 9 M4 9v12h16V9 M9 21v-8h6v8 M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 22v-3a8 8 0 0 1 16 0v3',
  logout: 'M10 3H4v18h6 M9 12h12 m-4-4 4 4-4 4',
  Mercado: 'M4 8h16l-2 12H6L4 8 M8 8l2-5 m4 0 2 5 M9 12v4 m6-4v4',
  Farmácia: 'm5 19 14-14 M8 4a5 5 0 0 1 7 7l-4 4a5 5 0 0 1-7-7l4-4 M10 10l4 4',
  Beleza: 'm8 13 5-5 5 5-5 5-5-5 M13 8l4-6 4 4-3 7 M8 13l-5 5 3 3 7-3',
  Moda: 'M9 3v4L5 20h14L15 7V3 M9 7h6 M7 14h10',
  Eletrônicos: 'M3 3h18v14H3V3 M1 21h22 M8 17v4 m8-4v4',
  Jogos:
    'M7 7h10a4 4 0 0 1 4 4l1 7a2 2 0 0 1-4 1l-2-3H8l-2 3a2 2 0 0 1-4-1l1-7a4 4 0 0 1 4-4 M7 10v5 M5 12h4 M16 11h.1 M19 14h.1',
  Brinquedos:
    'M8 5a4 4 0 1 1 8 0 M8 8l-4 3 m12-3 4 3 M8 9v7h8V9 M9 16l-2 6 m8-6 2 6',
  Casa: 'm2 11 10-9 10 9 M5 9v13h14V9 M10 22v-8h4v8',
  chevron: 'm5 9 7 7 7-7',
};
export default function Icon({ name, size = 24 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] ?? paths.bag} />
    </svg>
  );
}
