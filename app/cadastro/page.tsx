'use client'
import React, {useState} from 'react';
import Image from 'next/image';
import {useRouter} from "next/navigation";
import { api } from '../../lib/api';







export default function Cadastro(){
    const router = useRouter();
    const[formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [erro, setErro] = useState('');
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        setErro('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    if (formData.password !== formData.confirmPassword) {
        setErro('As senhas não coincidem.');
        return;
    }

    try {
        setLoading(true);
        await api.post('/users', {
            name: formData.name,
            username: formData.username,
            email: formData.email,
            password: formData.password
        });

        alert('Cadastro realizado com sucesso!');
        router.push('/login');

    } catch (error) {
        console.error(error);
        setErro('Ocorreu um erro ao criar a conta. Verifique os dados e tente novamente.');
    } 
};
    
    return (
        
        <div className="flex flex-row h-screen bg-amber-50 overflow-hidden gap-20 ">
            <div className= "w-[654px] h-[1068px] bg-gray-950 rounded-t-[40px] items-start justify-start ml-[150px] mt-[113px] p-12">
                <h1 className= "text-3xl font-extrabold text-center mb-6 text-amber-50">
                    CRIE SUA CONTA
                </h1>
                <form onSubmit={handleSubmit}>
                    <fieldset className="flex flex-col gap-6">
                          
                        <div className="bg-amber-50 rounded-3xl w-[504px] h-[48px] mx-auto px-5 flex items-center">
                            <input 
                            type="text" 
                            name="name" 
                            id="name" 
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Nome Completo"
                            
                            className="w-full bg-transparent outline-none text-gray-700 font-light placeholder-gray-700"/>
                        </div>
                        <div className="bg-amber-50 rounded-3xl w-[504px] h-[48px] mx-auto px-5 flex items-center">
                            <input 
                            type="text" 
                            name="username" 
                            id="username" 
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="w-full bg-transparent outline-none text-gray-700 font-light placeholder-gray-700" />
                        </div>
                        <div className="bg-amber-50 rounded-3xl w-[504px] h-[48px] mx-auto px-5 flex items-center">
                            <input 
                            type="email" 
                            name="email" 
                            id="email" 
                            placeholder="E-mail"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full bg-transparent outline-none text-gray-700 font-light placeholder-gray-700" />
                        </div>
                        <div className="bg-amber-50 rounded-3xl w-[504px] h-[48px] mx-auto px-5 flex items-center">
                            <input 
                            type="password" 
                            name="password" 
                            id="password" 
                            placeholder="Senha"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full bg-transparent outline-none text-gray-700 font-light placeholder-gray-700" />
                        </div>
                        <div className="bg-amber-50 rounded-3xl w-[504px] h-[48px] mx-auto px-5 flex items-center">
                            <input 
                            type="password" 
                            name="confirmPassword" 
                            id="confirmPassword" 
                            placeholder="Confirmar Senha"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full bg-transparent outline-none text-gray-700 font-light placeholder-gray-700" />
                        </div>
                        {erro && <p className="text-red-400 text-center text-sm">{erro}</p>}
                        
                             <button type="submit" disabled={loading} className=" font-semibold flex justify-center items-center rounded-3xl bg-purple-900 w-[504px] h-[48px] text-white mx-auto">
                            {loading ? 'CRIANDO...' : 'CRIAR CONTA'}
  </button>
                       
                    </fieldset>
                    
                </form>
                 <div className= "flex flex-row gap-2 items-center mt-2 px-5 w-[282px] h-[23px]">
                            <h1 className=" text-white font-light">Já possui uma conta?</h1>
                            <button className= " text-purple-900 font-medium" 
                            type ="button"
                            onClick={() => router.push('/login')}> Login
                            </button> 
                        </div>
            </div>
            
           <div className= "flex flex-col items-center">
            <Image src="/logo.svg" alt="Logo Stock.io" width={350} height={100}
           className="w-auto h-auto ml-[250px] mt-[-20px]"
           />
           <Image src="/mascotelogin.svg" alt="Mascote Login Stock.io"  width={496} height={1128} className="ml-[250px] mt-[10px]"
           />
           </div>
            

        </div>
    );
}
