type CardProdutoProps = {
  nome: string;
  preco: number;
  imagem: string;
  marca: string;
};

export default function CardProduto({
  nome,
  preco,
  imagem,
  marca,
}: CardProdutoProps) {
  return (
    <div className="relative rounded-[28px] px-[22px] pt-3 pb-[22px] w-[232px] shrink-0 bg-white">
      <span className="absolute top-4 right-5 w-16 h-16 rounded-full bg-pink-50 text-[8px] flex items-center justify-center">
        {marca}
      </span>
      {imagem ? (
        <img
          src={imagem}
          alt={`Imagem do ${nome}`}
          className="w-full h-[170px] object-contain"
        />
      ) : (
        <div className="w-full h-[170px] bg-gray-200 rounded-lg"></div>
      )}

      <h3 className="text-[26.65px] font-medium leading-none mt-1">{nome}</h3>
      <p className="text-[23.02px] font-medium leading-none mt-2">
        R${preco.toFixed(2).replace(".", ",")}
      </p>
    </div>
  );
}
