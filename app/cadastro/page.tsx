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
            </div>
            

        </div>
    );
}