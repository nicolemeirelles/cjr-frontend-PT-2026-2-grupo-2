'use client'
import React, {useState} from 'react';

type Task = {
    id: number;
    title: string;
    description: string;
    done: boolean;
    createdAt: string;
    updatedAt?: string;
    expanded?: boolean;

}
export default function Cadastro(){
    return (
        <div className="flex flex-col h-screen bg-amber-50 overflow-hidden">
            <div className= "w-[654px] h-[1068px] bg-gray-950 rounded-t-[40px] items-start justify-start ml-[150px] mt-[113px] p-12">
                <h1 className= "text-3xl font-bold text-center mb-6 text-amber-50">
                    CRIE SUA CONTA
                </h1>
                <form>
                    <fieldset className="flex flex-col gap-6">
                        <div className="bg-amber-50 rounded-3xl w-[504px] h-[48px] mx-auto px-5 flex items-center">
                            <input 
                            type="text" 
                            name="nome" 
                            id="nome" 
                            placeholder="Nome Completo"
                            className="w-full bg-transparent outline-none text-gray-700 font-bold placeholder-gray-700"/>
                        </div>
                        <div className="bg-amber-50 rounded-3xl w-[504px] h-[48px] mx-auto px-5 flex items-center">
                            <input 
                            type="string" 
                            name="username" 
                            id="username" 
                            placeholder="Username"
                            className="w-full bg-transparent outline-none text-gray-700 font-bold placeholder-gray-700" />
                        </div>
                        <div className="bg-amber-50 rounded-3xl w-[504px] h-[48px] mx-auto px-5 flex items-center">
                            <input 
                            type="e-mail" 
                            name="e-mail" 
                            id="e-mail" 
                            placeholder="E-mail"
                            className="w-full bg-transparent outline-none text-gray-700 font-bold placeholder-gray-700" />
                        </div>
                        <div className="bg-amber-50 rounded-3xl w-[504px] h-[48px] mx-auto px-5 flex items-center">
                            <input 
                            type="password" 
                            name="senha" 
                            id="senha" 
                            placeholder="Senha"
                            className="w-full bg-transparent outline-none text-gray-700 font-bold placeholder-gray-700" />
                        </div>
                        <div className="bg-amber-50 rounded-3xl w-[504px] h-[48px] mx-auto px-5 flex items-center">
                            <input 
                            type="password" 
                            name="senha" 
                            id="senha" 
                            placeholder="Confirmar Senha"
                            className="w-full bg-transparent outline-none text-gray-700 font-bold placeholder-gray-700" />
                        </div>
                        
                            <button 
                            type = "submit"
                            className="flex justify-center items-center rounded-3xl bg-purple-900 w-[504px] h-[48px] text-white mx-auto"
                            >CRIAR CONTA</button>
                        
                        <div>
                            <label>Já possui uma conta?</label>
                            <button type ="button"> Login</button>
                        </div>
                    </fieldset>
                    
                </form>
            </div>
            

        </div>
    );
}