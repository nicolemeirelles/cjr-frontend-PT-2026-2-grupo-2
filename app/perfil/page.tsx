import Link from "next/link";
import ProductCard from "@/app/components/catalog/ProductCard";
import Navbar from "@/app/components/catalog/Navbar";

export default function Perfil() {
  const usuario = {
    nome: "Nome do Usuário",
    email: "Email do Usuário",
    nomePerfil: "Nome de Perfil",
    foto: "",
  };

  const estiloFoto = "w-[232px] h-[232px] rounded-full -mt-[170px]";

  const produtos = [
    { id: 1, nome: "Produto 1", preco: 1.99, imagem: "", marca: "CJR" },
    { id: 2, nome: "Produto 2", preco: 2.99, imagem: "", marca: "CJR" },
    { id: 3, nome: "Produto 3", preco: 3.99, imagem: "", marca: "CJR" },
    { id: 4, nome: "Produto 4", preco: 4.99, imagem: "", marca: "CJR" },
    { id: 5, nome: "Produto 5", preco: 5.99, imagem: "", marca: "CJR" },
  ];

  return (
    <main className="min-h-screen bg-[#F5F0E1] text-black">
      <Navbar authenticated={true} demo={false} />
      <div className="bg-black h-[372px] w-full flex items-end px-[110px] pb-[52px]">
        <Link href="/" aria-label="Voltar" className="text-white block">
          <svg
            width="35"
            height="54"
            viewBox="0 0 35 54"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M31 3 5 27l26 24" />
          </svg>
        </Link>
      </div>
      <div className="relative px-[110px] flex justify-between items-start">
        <div className="ml-[66px]">
          {usuario.foto ? (
            <img
              src={usuario.foto}
              alt={`Foto de ${usuario.nome}`}
              className={`${estiloFoto} object-cover`}
            />
          ) : (
            <div className={`${estiloFoto} bg-gray-300`}> </div>
          )}
          <div>
            <h1 className="text-[52.56px] font-medium leading-none mt-2">
              {usuario.nome}
            </h1>
            <p className="text-[29.15px] font-light text-gray-500">
              @ {usuario.nomePerfil}
            </p>
            <p className="text-[29.15px] font-light flex items-center gap-2 text-gray-500">
              <img src="/email.svg" alt="" className="w-5 h-5" />
              {usuario.email}
            </p>
          </div>
        </div>

        <button className="mt-8 w-[326px] h-[43px] bg-violet-600 text-white text-xl font-medium rounded-full shadow-md hover:bg-violet-700 cursor-pointer">
          Editar Perfil
        </button>
      </div>
      <section className="flex justify-between items-center px-[110px] mt-10">
        <h2 className="text-[36.25px] font-medium">Produtos</h2>
        <a href="#" className="text-[15.99px] font-medium text-violet-700">
          ver mais
        </a>
      </section>
      <div className="px-[110px] mt-9 pb-16">
        <div className="flex gap-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {produtos.map((produto) => (
            <div key={produto.id} className="w-[232px] shrink-0">
              <ProductCard
                showStock={false}
                product={{
                  id: produto.id,
                  name: produto.nome,
                  price: produto.preco,
                  image: produto.imagem,
                  stock: 1,
                  storeName: produto.marca,
                  categoryId: 1,
                  storeLogo: "",
                  createdAt: "2026-01-01T00:00:00.000Z",
                  rating: 0,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
