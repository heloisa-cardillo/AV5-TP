// src/telas/Hospedes.tsx
import React, { useState, useEffect } from 'react';
import Tabela from '../componentes/Tabela';
import Modal from '../componentes/Modal';
import type { Cliente, Documento, Endereco, Telefone } from '../types';
import { TipoDocumento } from '../types';
import { getHospedes, criarHospede, atualizarHospede, deletarHospede } from '../services/api';
import './Hospedes.css';

const FORM_CLIENTE_INICIAL = {
    nome: '',
    nomeSocial: '',
    dataNascimento: '',
    foto: '',
    rua: '',
    bairro: '',
    cidade: '',
    estado: '',
    pais: 'Brasil',
    codigoPostal: '',
    ddd: '',
    numero: '',
    codigoTitular: ''
};

const FORM_DOC_INICIAL = { numero: '', tipo: TipoDocumento.CPF, dataExpedicao: '' };

const Hospedes: React.FC = () => {
    const [hospedes, setHospedes] = useState<Cliente[]>([]);

    const [modalAberto, setModalAberto] = useState(false);
    const [modalDocAberto, setModalDocAberto] = useState(false);
    const [hospedeEditando, setHospedeEditando] = useState<Cliente | null>(null);
    const [hospedeDetalhe, setHospedeDetalhe] = useState<Cliente | null>(null);
    const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);
    const [busca, setBusca] = useState('');
    const [erro, setErro] = useState('');
    const [tipoModal, setTipoModal] = useState<'titular' | 'dependente'>('titular');
    const [expandido, setExpandido] = useState<string | null>(null);
    const [docEditandoIndex, setDocEditandoIndex] = useState<number | null>(null);

    const [formData, setFormData] = useState(FORM_CLIENTE_INICIAL);
    const [formDoc, setFormDoc] = useState(FORM_DOC_INICIAL);

    // Carrega hóspedes da API ao montar
    useEffect(() => {
        getHospedes().then(setHospedes).catch(console.error);
    }, []);

    const recarregar = () => getHospedes().then(setHospedes).catch(console.error);

    const gerarCodigo = (prefixo: string): string => {
        const existentes = hospedes.map(h => h.codigo);
        let i = hospedes.length + 1;
        let codigo = `${prefixo}${String(i).padStart(3, '0')}`;
        while (existentes.includes(codigo)) {
            i++;
            codigo = `${prefixo}${String(i).padStart(3, '0')}`;
        }
        return codigo;
    };

    const abrirModalTitular = (hospede?: Cliente) => {
        setErro('');
        setTipoModal('titular');
        if (hospede) {
            setHospedeEditando(hospede);
            setFormData({
                nome: hospede.nome,
                nomeSocial: hospede.nomeSocial,
                dataNascimento: hospede.dataNascimento,
                foto: hospede.foto,
                rua: hospede.endereco?.rua || '',
                bairro: hospede.endereco?.bairro || '',
                cidade: hospede.endereco?.cidade || '',
                estado: hospede.endereco?.estado || '',
                pais: hospede.endereco?.pais || 'Brasil',
                codigoPostal: hospede.endereco?.codigoPostal || '',
                ddd: hospede.telefones?.[0]?.ddd || '',
                numero: hospede.telefones?.[0]?.numero || '',
                codigoTitular: ''
            });
        } else {
            setHospedeEditando(null);
            setFormData(FORM_CLIENTE_INICIAL);
        }
        setModalAberto(true);
    };

    const abrirModalDependente = (titular: Cliente, dependente?: Cliente) => {
        setErro('');
        setTipoModal('dependente');
        setHospedeDetalhe(titular);
        if (dependente) {
            setHospedeEditando(dependente);
            setFormData({
                nome: dependente.nome,
                nomeSocial: dependente.nomeSocial,
                dataNascimento: dependente.dataNascimento,
                foto: dependente.foto,
                rua: '',
                bairro: '',
                cidade: '',
                estado: '',
                pais: 'Brasil',
                codigoPostal: '',
                ddd: '',
                numero: '',
                codigoTitular: titular.codigo
            });
        } else {
            setHospedeEditando(null);
            setFormData({ ...FORM_CLIENTE_INICIAL, codigoTitular: titular.codigo });
        }
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setHospedeEditando(null);
        setErro('');
    };

    const salvarHospede = async () => {
        setErro('');
        if (!formData.nome || !formData.dataNascimento) {
            setErro('Nome e data de nascimento são obrigatórios.');
            return;
        }

        const endereco: Endereco = {
            rua: formData.rua,
            bairro: formData.bairro,
            cidade: formData.cidade,
            estado: formData.estado,
            pais: formData.pais,
            codigoPostal: formData.codigoPostal
        };

        const telefones: Telefone[] = formData.ddd && formData.numero
            ? [{ ddd: formData.ddd, numero: formData.numero }]
            : [];

        try {
            if (hospedeEditando) {
                await atualizarHospede(hospedeEditando.codigo, {
                    nome: formData.nome,
                    nomeSocial: formData.nomeSocial,
                    dataNascimento: formData.dataNascimento,
                    foto: formData.foto,
                    endereco,
                    telefones,
                    documentos: hospedeEditando.documentos,
                });
            } else {
                const codigo = gerarCodigo(tipoModal === 'dependente' ? 'DEP' : 'HSP');
                await criarHospede({
                    codigo,
                    nome: formData.nome,
                    nomeSocial: formData.nomeSocial,
                    dataNascimento: formData.dataNascimento,
                    foto: formData.foto || '/icones/iconePadrao.png',
                    endereco,
                    telefones,
                    documentos: [],
                    dependentes: [],
                    codigoTitular: tipoModal === 'dependente' ? formData.codigoTitular : undefined,
                });
            }
            await recarregar();
            fecharModal();
        } catch (e) {
            setErro('Erro ao salvar hóspede. Verifique se o backend está rodando.');
        }
    };

    const excluirHospede = async (hospede: Cliente) => {
        try {
            await deletarHospede(hospede.codigo);
            await recarregar();
        } catch (e) {
            console.error('Erro ao excluir hóspede', e);
        }
    };

    const abrirModalDoc = (hospede: Cliente) => {
        const atualizado = hospedes.find(h => h.codigo === hospede.codigo) || hospede;
        setHospedeDetalhe(atualizado);
        setFormDoc(FORM_DOC_INICIAL);
        setDocEditandoIndex(null);
        setModalDocAberto(true);
        setModalAberto(false);
    };

    const editarDocumento = (index: number) => {
        if (!hospedeDetalhe) return;
        const doc = hospedeDetalhe.documentos[index];
        setFormDoc({ numero: doc.numero, tipo: doc.tipo, dataExpedicao: doc.dataExpedicao });
        setDocEditandoIndex(index);
    };

    const salvarDocumento = async () => {
        if (!formDoc.numero || !formDoc.dataExpedicao || !hospedeDetalhe) return;
        const novoDoc: Documento = { numero: formDoc.numero, tipo: formDoc.tipo, dataExpedicao: formDoc.dataExpedicao };

        const docs = [...hospedeDetalhe.documentos];
        if (docEditandoIndex !== null) {
            docs[docEditandoIndex] = novoDoc;
        } else {
            docs.push(novoDoc);
        }

        try {
            await atualizarHospede(hospedeDetalhe.codigo, { documentos: docs });
            await recarregar();
            setHospedeDetalhe(prev => prev ? { ...prev, documentos: docs } : prev);
            setFormDoc(FORM_DOC_INICIAL);
            setDocEditandoIndex(null);
        } catch (e) {
            console.error('Erro ao salvar documento', e);
        }
    };

    const excluirDocumento = async (index: number) => {
        if (!hospedeDetalhe) return;
        const docs = hospedeDetalhe.documentos.filter((_: Documento, i: number) => i !== index);
        try {
            await atualizarHospede(hospedeDetalhe.codigo, { documentos: docs });
            await recarregar();
            setHospedeDetalhe(prev => prev ? { ...prev, documentos: docs } : prev);
            if (docEditandoIndex === index) {
                setFormDoc(FORM_DOC_INICIAL);
                setDocEditandoIndex(null);
            }
        } catch (e) {
            console.error('Erro ao excluir documento', e);
        }
    };

    const getDependentes = (titular: Cliente) =>
        hospedes.filter(h => titular.dependentes.includes(h.codigo));

    const HOSPEDE_EASTER_EGG: Cliente = {
        codigo: 'EGG001',
        nome: 'Lola',
        nomeSocial: 'A calopsita',
        dataNascimento: '2020-04-01',
        dataCadastro: '2024-01-01',
        telefones: [{ ddd: '12', numero: '99999-9999' }],
        endereco: {
            rua: 'Rua dos Pássaros, 1',
            bairro: 'Ninho Dourado',
            cidade: 'São José dos Campos',
            estado: 'SP',
            pais: 'Brasil',
            codigoPostal: '12000-000'
        },
        documentos: [{ numero: '000.000.000-00', tipo: TipoDocumento.CPF, dataExpedicao: '2020-04-01' }],
        dependentes: [],
        foto: '/imagens/lola.png'
    };

    const titulares = hospedes.filter(h => !h.codigoTitular);
    const dadosFiltrados = busca === 'INFILTRADA'
        ? [HOSPEDE_EASTER_EGG]
        : titulares.filter(h =>
            !busca || h.nome.toLowerCase().includes(busca.toLowerCase()) || h.nomeSocial.toLowerCase().includes(busca.toLowerCase())
        );

    const colunas = [
        {
            key: 'foto',
            label: '',
            render: (value: string) => (
                <img
                    src={value || '/icones/iconePadrao.png'}
                    alt="Foto"
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => setFotoAmpliada(value)}
                />
            )
        },
        { key: 'codigo', label: 'Código' },
        { key: 'nome', label: 'Nome' },
        { key: 'nomeSocial', label: 'Nome Social' },
        { key: 'dataNascimento', label: 'Nascimento' },
        { key: 'dataCadastro', label: 'Cadastro' },
        {
            key: 'dependentes',
            label: 'Dependentes',
            render: (value: string[]) => <span className="badge badge-info">{value.length}</span>
        },
        {
            key: 'documentos',
            label: 'Documentos',
            render: (value: Documento[]) => <span>{value.length}</span>
        }
    ];

    return (
        <div>
            <div className="page-header">
                <h1>Hóspedes</h1>
                <button className="btn-primary" onClick={() => abrirModalTitular()}>+ NOVO HÓSPEDE</button>
            </div>

            <div className="filters-bar">
                <input type="text" className="filter-input" placeholder="Buscar por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>

            <Tabela
                columns={colunas}
                data={dadosFiltrados}
                customActions={(hospede: Cliente) => (
                    <div className="table-actions">
                        <button className="btn-icon btn-edit" onClick={() => abrirModalTitular(hospede)}>Editar</button>
                        <button className="btn-icon" onClick={() => setExpandido(expandido === hospede.codigo ? null : hospede.codigo)}>
                            {expandido === hospede.codigo ? 'Recolher' : 'Dependentes'}
                        </button>
                        <button className="btn-icon btn-delete" onClick={() => excluirHospede(hospede)}>Excluir</button>
                    </div>
                )}
                renderExpand={(hospede: Cliente) => {
                    const titularAtual = hospedes.find(h => h.codigo === hospede.codigo) || hospede;
                    return expandido === titularAtual.codigo ? (
                        <div className="dependentes-accordion">
                            <div className="dependentes-header">
                                <button className="btn-primary" onClick={() => abrirModalDependente(titularAtual)}>+ Adicionar Dependente</button>
                            </div>

                            {getDependentes(titularAtual).length === 0 ? (
                                <p className="sem-dados">Nenhum dependente cadastrado</p>
                            ) : (
                                getDependentes(titularAtual).map((dep: Cliente) => (
                                    <div key={dep.codigo} className="dependente-card">
                                        <div className="dependente-card-header">
                                            <div className="dependente-info">
                                                <img src={dep.foto || '/icones/iconePadrao.png'} alt="Foto" className="dependente-foto" onClick={() => setFotoAmpliada(dep.foto)} />
                                                <div>
                                                    <div className="dependente-nome">{dep.nome}</div>
                                                    <div className="dependente-sub">{dep.nomeSocial} — {dep.dataNascimento}</div>
                                                </div>
                                            </div>
                                            <div className="dependente-acoes">
                                                <button className="btn-icon btn-edit btn-sm" onClick={() => abrirModalDependente(titularAtual, dep)}>Editar dados pessoais</button>
                                                <button className="btn-danger btn-sm" onClick={() => excluirHospede(dep)}>Remover dependente</button>
                                            </div>
                                        </div>

                                        <div className="dependente-dados-titular">
                                            <div className="dados-titular-label">Dados compartilhados com o titular (somente leitura)</div>
                                            <div className="dados-titular-grid">
                                                <div className="dados-titular-item">
                                                    <span className="dados-titular-titulo">Endereço</span>
                                                    <span className="dados-titular-valor">
                                                        {titularAtual.endereco?.rua
                                                            ? `${titularAtual.endereco.rua}, ${titularAtual.endereco.bairro} — ${titularAtual.endereco.cidade}/${titularAtual.endereco.estado}, CEP ${titularAtual.endereco.codigoPostal}`
                                                            : 'Não informado'}
                                                    </span>
                                                </div>
                                                <div className="dados-titular-item">
                                                    <span className="dados-titular-titulo">Telefone</span>
                                                    <span className="dados-titular-valor">
                                                        {titularAtual.telefones?.length > 0
                                                            ? `(${titularAtual.telefones[0].ddd}) ${titularAtual.telefones[0].numero}`
                                                            : 'Não informado'}
                                                    </span>
                                                </div>
                                                <div className="dados-titular-item">
                                                    <span className="dados-titular-titulo">Documentos</span>
                                                    <span className="dados-titular-valor">
                                                        {titularAtual.documentos?.length > 0
                                                            ? titularAtual.documentos.map((d: Documento) => `${d.tipo}: ${d.numero}`).join(' | ')
                                                            : 'Nenhum documento'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : null;
                }}
            />

            {/* Modal Hóspede / Dependente */}
            <Modal
                isOpen={modalAberto}
                onClose={fecharModal}
                title={hospedeEditando
                    ? tipoModal === 'dependente' ? `Editar Dependente — ${hospedeEditando.nome}` : 'Editar Hóspede'
                    : tipoModal === 'dependente' ? `Novo Dependente de ${hospedeDetalhe?.nome}` : 'Novo Hóspede'}
            >
                <div>
                    {erro && <div className="alert alert-error">{erro}</div>}

                    <h3 className="form-section-title">Dados Pessoais</h3>
                    <div className="form-group">
                        <label className="form-label">Nome:</label>
                        <input type="text" className="form-input" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} placeholder="Ex: José Ricardo" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Nome Social:</label>
                        <input type="text" className="form-input" value={formData.nomeSocial} onChange={e => setFormData({ ...formData, nomeSocial: e.target.value })} placeholder="Ex: José" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Data de Nascimento:</label>
                        <input type="date" className="form-input" value={formData.dataNascimento} onChange={e => setFormData({ ...formData, dataNascimento: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Foto (caminho):</label>
                        <input type="text" className="form-input" value={formData.foto} onChange={e => setFormData({ ...formData, foto: e.target.value })} placeholder="/imagens/jose.png" />
                    </div>

                    {tipoModal === 'titular' && (
                        <>
                            <h3 className="form-section-title">Endereço</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Rua:</label>
                                    <input type="text" className="form-input" value={formData.rua} onChange={e => setFormData({ ...formData, rua: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Bairro:</label>
                                    <input type="text" className="form-input" value={formData.bairro} onChange={e => setFormData({ ...formData, bairro: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Cidade:</label>
                                    <input type="text" className="form-input" value={formData.cidade} onChange={e => setFormData({ ...formData, cidade: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Estado:</label>
                                    <input type="text" className="form-input" value={formData.estado} onChange={e => setFormData({ ...formData, estado: e.target.value })} placeholder="Ex: SP" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">País:</label>
                                    <input type="text" className="form-input" value={formData.pais} onChange={e => setFormData({ ...formData, pais: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">CEP:</label>
                                    <input type="text" className="form-input" value={formData.codigoPostal} onChange={e => setFormData({ ...formData, codigoPostal: e.target.value })} placeholder="Ex: 12246-000" />
                                </div>
                            </div>

                            <h3 className="form-section-title">Telefone</h3>
                            <div className="form-row">
                                <div className="form-group form-group-small">
                                    <label className="form-label">DDD:</label>
                                    <input type="text" className="form-input" value={formData.ddd} onChange={e => setFormData({ ...formData, ddd: e.target.value })} placeholder="12" maxLength={3} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Número:</label>
                                    <input type="text" className="form-input" value={formData.numero} onChange={e => setFormData({ ...formData, numero: e.target.value })} placeholder="98765-4321" />
                                </div>
                            </div>

                            <h3 className="form-section-title">Documentos</h3>
                            <button className="btn-secondary" style={{ marginBottom: '16px' }} onClick={() => abrirModalDoc(hospedeEditando!)}>
                                Gerenciar Documentos
                            </button>
                        </>
                    )}

                    <div className="modal-footer">
                        <button className="btn-secondary" onClick={fecharModal}>Cancelar</button>
                        <button className="btn-primary" onClick={salvarHospede}>Salvar</button>
                    </div>
                </div>
            </Modal>

            {/* Modal Documentos CRUD */}
            <Modal isOpen={modalDocAberto} onClose={() => setModalDocAberto(false)} title={`Documentos — ${hospedeDetalhe?.nome}`}>
                <div>
                    {hospedeDetalhe && hospedeDetalhe.documentos?.length > 0 ? (
                        <table className="inner-table" style={{ marginBottom: '24px' }}>
                            <thead>
                                <tr><th>Tipo</th><th>Número</th><th>Expedição</th><th></th></tr>
                            </thead>
                            <tbody>
                                {hospedeDetalhe.documentos.map((doc: Documento, i: number) => (
                                    <tr key={i} style={{ background: docEditandoIndex === i ? '#EEF2FF' : 'white' }}>
                                        <td>{doc.tipo}</td>
                                        <td>{doc.numero}</td>
                                        <td>{doc.dataExpedicao}</td>
                                        <td style={{ display: 'flex', gap: '6px' }}>
                                            <button className="btn-icon btn-edit btn-sm" onClick={() => editarDocumento(i)}>Editar</button>
                                            <button className="btn-danger btn-sm" onClick={() => excluirDocumento(i)}>Remover</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="sem-dados" style={{ marginBottom: '24px' }}>Nenhum documento cadastrado</p>
                    )}

                    <h3 className="form-section-title">{docEditandoIndex !== null ? 'Editar Documento' : 'Adicionar Documento'}</h3>
                    <div className="form-group">
                        <label className="form-label">Tipo:</label>
                        <select className="form-select" value={formDoc.tipo} onChange={e => setFormDoc({ ...formDoc, tipo: e.target.value as TipoDocumento })}>
                            <option value={TipoDocumento.CPF}>CPF</option>
                            <option value={TipoDocumento.RG}>RG</option>
                            <option value={TipoDocumento.Passaporte}>Passaporte</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Número:</label>
                        <input type="text" className="form-input" value={formDoc.numero} onChange={e => setFormDoc({ ...formDoc, numero: e.target.value })} placeholder="Ex: 111.111.111-11" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Data de Expedição:</label>
                        <input type="date" className="form-input" value={formDoc.dataExpedicao} onChange={e => setFormDoc({ ...formDoc, dataExpedicao: e.target.value })} />
                    </div>
                    <div className="modal-footer">
                        {docEditandoIndex !== null && (
                            <button className="btn-secondary" onClick={() => { setFormDoc(FORM_DOC_INICIAL); setDocEditandoIndex(null); }}>Cancelar edição</button>
                        )}
                        <button className="btn-primary" onClick={salvarDocumento}>
                            {docEditandoIndex !== null ? 'Salvar alteração' : 'Adicionar'}
                        </button>
                    </div>
                </div>
            </Modal>

            {fotoAmpliada && (
                <div className="foto-ampliada-overlay" onClick={() => setFotoAmpliada(null)}>
                    <div className="foto-ampliada-container">
                        <img src={fotoAmpliada} alt="Foto ampliada" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Hospedes;