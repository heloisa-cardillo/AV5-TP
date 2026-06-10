// src/telas/Acomodacoes.tsx
import React, { useEffect, useState } from 'react';
import type { Acomodacao } from '../types';
import { NOME_EXIBICAO_ACOMODACAO, NOME_CURTO_ACOMODACAO } from '../types';
import { getAcomodacoes } from '../services/api';
import './Acomodacoes.css';

const Acomodacoes: React.FC = () => {
    const [acomodacoes, setAcomodacoes] = useState<Acomodacao[]>([]);

    useEffect(() => {
        getAcomodacoes().then(setAcomodacoes).catch(console.error);
    }, []);

    return (
        <div>
            <div className="page-header">
                <h1>Acomodações</h1>
            </div>

            <div className="acomodacoes-grid">
                {acomodacoes.map((acom) => (
                    <div key={acom.codigo} className="acomodacao-card">
                        <div className="acomodacao-card-header">
                            <div className="acomodacao-icone">
                                <img src="/icones/iconeQuartos.png" alt="Quarto" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                            </div>
                            <div>
                                <div className="acomodacao-nome-exibicao">
                                    {NOME_EXIBICAO_ACOMODACAO[acom.nomeAcomodacao]}
                                </div>
                                <div className="acomodacao-nome-real">
                                    {NOME_CURTO_ACOMODACAO[acom.nomeAcomodacao]}
                                </div>
                            </div>
                        </div>

                        <div className="acomodacao-detalhes">
                            <div className="acomodacao-detalhe">
                                <span className="detalhe-label"> Cama Solteiro</span>
                                <span className="detalhe-valor">{acom.camaSolteiro}</span>
                            </div>
                            <div className="acomodacao-detalhe">
                                <span className="detalhe-label"> Cama Casal</span>
                                <span className="detalhe-valor">{acom.camaCasal}</span>
                            </div>
                            <div className="acomodacao-detalhe">
                                <span className="detalhe-label"> Suíte</span>
                                <span className="detalhe-valor">{acom.suite}</span>
                            </div>
                            <div className="acomodacao-detalhe">
                                <span className="detalhe-label"> Climatização</span>
                                <span className="detalhe-valor">
                                    {acom.climatizacao ? 'Sim' : 'Não'}
                                </span>
                            </div>
                            <div className="acomodacao-detalhe">
                                <span className="detalhe-label"> Garagem</span>
                                <span className="detalhe-valor">{acom.garagem} vaga{acom.garagem !== 1 ? 's' : ''}</span>
                            </div>
                        </div>

                        <div className="acomodacao-codigo">
                            {acom.codigo}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Acomodacoes;