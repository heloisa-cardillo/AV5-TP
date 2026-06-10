import type { Cliente, Hospedagem, Acomodacao } from '../types';

const BASE_URL = 'http://localhost:3001';

// ── Hóspedes ──────────────────────────────────────────────
export const getHospedes = async (): Promise<Cliente[]> => {
    const res = await fetch(`${BASE_URL}/hospedes`);
    if (!res.ok) throw new Error('Erro ao buscar hóspedes');
    return res.json();
};

export const criarHospede = async (hospede: Omit<Cliente, 'dataCadastro'>): Promise<Cliente> => {
    const res = await fetch(`${BASE_URL}/hospedes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hospede),
    });
    if (!res.ok) throw new Error('Erro ao criar hóspede');
    return res.json();
};

export const atualizarHospede = async (codigo: string, hospede: Partial<Cliente>): Promise<Cliente> => {
    const res = await fetch(`${BASE_URL}/hospedes/${codigo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hospede),
    });
    if (!res.ok) throw new Error('Erro ao atualizar hóspede');
    return res.json();
};

export const deletarHospede = async (codigo: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/hospedes/${codigo}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir hóspede');
};

// ── Hospedagens ───────────────────────────────────────────
export const getHospedagens = async (): Promise<Hospedagem[]> => {
    const res = await fetch(`${BASE_URL}/hospedagens`);
    if (!res.ok) throw new Error('Erro ao buscar hospedagens');
    return res.json();
};

export const criarHospedagem = async (hospedagem: Hospedagem): Promise<Hospedagem> => {
    const res = await fetch(`${BASE_URL}/hospedagens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hospedagem),
    });
    if (!res.ok) throw new Error('Erro ao criar hospedagem');
    return res.json();
};

export const deletarHospedagem = async (codigo: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/hospedagens/${codigo}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir hospedagem');
};

// ── Acomodações ───────────────────────────────────────────
export const getAcomodacoes = async (): Promise<Acomodacao[]> => {
    const res = await fetch(`${BASE_URL}/acomodacoes`);
    if (!res.ok) throw new Error('Erro ao buscar acomodações');
    return res.json();
};