// src/telas/Hospedagens.tsx
import React, { useState, useEffect } from 'react';
import Tabela from '../componentes/Tabela';
import Modal from '../componentes/Modal';
import type { Hospedagem, Cliente, Acomodacao } from '../types';
import { NOME_EXIBICAO_ACOMODACAO } from '../types';
import { getHospedes, getHospedagens, criarHospedagem, deletarHospedagem, getAcomodacoes } from '../services/api';
import './Hospedagens.css';

const Hospedagens: React.FC = () => {
    const [hospedagens, setHospedagens] = useState<Hospedagem[]>([]);
    const [hospedes, setHospedes] = useState<Cliente[]>([]);
    const [acomodacoes, setAcomodacoes] = useState<Acomodacao[]>([]);

    const [modalAberto, setModalAberto] = useState(false);
    const [erro, setErro] = useState('');
    const [busca, setBusca] = useState('');

    const [formData, setFormData] = useState({
        codigoCliente: '',
        codigoAcomodacao: '',
        dataCheckIn: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        getHospedagens().then(setHospedagens).catch(console.error);
        getHospedes().then(setHospedes).catch(console.error);
        getAcomodacoes().then(setAcomodacoes).catch(console.error);
    }, []);

    const recarregar = () => getHospedagens().then(setHospedagens).catch(console.error);

    const gerarCodigo = (): string => {
        const existentes = hospedagens.map(h => h.codigo);
        let i = hospedagens.length + 1;
        let codigo = `HOS${String(i).padStart(3, '0')}`;
        while (existentes.includes(codigo)) {
            i++;
            codigo = `HOS${String(i).padStart(3, '0')}`;
        }
        return codigo;
    };

    const abrirModal = () => {
        setErro('');
        setFormData({
            codigoCliente: '',
            codigoAcomodacao: '',
            dataCheckIn: new Date().toISOString().split('T')[0]
        });
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setErro('');
    };

    const salvarHospedagem = async () => {
        setErro('');
        if (!formData.codigoCliente || !formData.codigoAcomodacao || !formData.dataCheckIn) {
            setErro('Todos os campos são obrigatórios.');
            return;
        }

        try {
            await criarHospedagem({
                codigo: gerarCodigo(),
                codigoCliente: formData.codigoCliente,
                codigoAcomodacao: formData.codigoAcomodacao,
                dataCheckIn: formData.dataCheckIn
            });
            await recarregar();
            fecharModal();
        } catch (e) {
            setErro('Erro ao registrar hospedagem. Verifique se o backend está rodando.');
        }
    };

    const excluirHospedagem = async (hospedagem: Hospedagem) => {
        try {
            await deletarHospedagem(hospedagem.codigo);
            await recarregar();
        } catch (e) {
            console.error('Erro ao excluir hospedagem', e);
        }
    };

    const getNomeHospede = (codigo: string): string => {
        const hospede = hospedes.find(h => h.codigo === codigo);
        return hospede ? `${hospede.nome} (${hospede.codigo})` : (codigo ?? '');
    };

    const getNomeAcomodacao = (codigo: string): string => {
        const acom = acomodacoes.find(a => a.codigo === codigo);
        if (!acom) return codigo ?? '';
        return NOME_EXIBICAO_ACOMODACAO[acom.nomeAcomodacao] ?? acom.nomeAcomodacao ?? (codigo ?? '');
    };

    const dadosFiltrados = hospedagens.filter(h => {
        const nomeHospede = getNomeHospede(h.codigoCliente).toLowerCase();
        const nomeAcom = getNomeAcomodacao(h.codigoAcomodacao).toLowerCase();
        return !busca || nomeHospede.includes(busca.toLowerCase()) || nomeAcom.includes(busca.toLowerCase());
    });

    const colunas = [
        { key: 'codigo', label: 'Código' },
        {
            key: 'codigoCliente',
            label: 'Hóspede',
            render: (value: string) => getNomeHospede(value)
        },
        {
            key: 'codigoAcomodacao',
            label: 'Acomodação',
            render: (value: string) => {
                const acom = acomodacoes.find(a => a.codigo === value);
                return acom ? (
                    <div>
                        <div style={{ fontWeight: 700 }}>{NOME_EXIBICAO_ACOMODACAO[acom.nomeAcomodacao] ?? acom.nomeAcomodacao}</div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{acom.nomeAcomodacao}</div>
                    </div>
                ) : value;
            }
        },
        { key: 'dataCheckIn', label: 'Check-in' }
    ];

    return (
        <div>
            <div className="page-header">
                <h1>Hospedagens</h1>
                <button className="btn-primary" onClick={abrirModal}>
                    + NOVO CHECK-IN
                </button>
            </div>

            <div className="filters-bar">
                <input
                    type="text"
                    className="filter-input"
                    placeholder="Buscar por hóspede ou acomodação..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
            </div>

            <Tabela
                columns={colunas}
                data={dadosFiltrados}
                onDelete={excluirHospedagem}
            />

            <Modal isOpen={modalAberto} onClose={fecharModal} title="Registrar Check-in">
                <div>
                    {erro && <div className="alert alert-error">{erro}</div>}

                    <div className="form-group">
                        <label className="form-label">Hóspede:</label>
                        <select className="form-select" value={formData.codigoCliente} onChange={e => setFormData({ ...formData, codigoCliente: e.target.value })}>
                            <option value="">Selecione um hóspede...</option>
                            {hospedes.map(h => (
                                <option key={h.codigo} value={h.codigo}>{h.nome} ({h.codigo})</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Acomodação:</label>
                        <select className="form-select" value={formData.codigoAcomodacao} onChange={e => setFormData({ ...formData, codigoAcomodacao: e.target.value })}>
                            <option value="">Selecione uma acomodação...</option>
                            {acomodacoes.map(a => (
                                <option key={a.codigo} value={a.codigo}>
                                    {NOME_EXIBICAO_ACOMODACAO[a.nomeAcomodacao] ?? a.nomeAcomodacao} ({a.nomeAcomodacao})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Data de Check-in:</label>
                        <input type="date" className="form-input" value={formData.dataCheckIn} min={new Date().toISOString().split('T')[0]} onChange={e => setFormData({ ...formData, dataCheckIn: e.target.value })} />
                    </div>

                    <div className="modal-footer">
                        <button className="btn-secondary" onClick={fecharModal}>Cancelar</button>
                        <button className="btn-primary" onClick={salvarHospedagem}>Registrar</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Hospedagens;