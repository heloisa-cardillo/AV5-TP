export enum TipoDocumento {
    CPF = 'Cadastro de Pessoa Física',
    RG = 'Registro Geral',
    Passaporte = 'Passaporte'
}

export enum NomeAcomodacao {
    SolteiroSimples = 'Acomodação simples para solteiro(a)',
    CasalSimples = 'Acomodação simples para casal',
    FamiliaSimples = 'Acomodação para família com até duas crianças',
    FamiliaMais = 'Acomodação para família com até cinco crianças',
    SolteiroMais = 'Acomodação com garagem para solteiro(a)',
    FamiliaSuper = 'Acomodação para até duas famílias, casal e três crianças cada'
}

export const NOME_EXIBICAO_ACOMODACAO: Record<NomeAcomodacao, string> = {
    [NomeAcomodacao.SolteiroSimples]: 'Single Bunny',
    [NomeAcomodacao.CasalSimples]: 'Velvet Bunny Suite',
    [NomeAcomodacao.FamiliaSimples]: 'Moon Bunny Lodge',
    [NomeAcomodacao.FamiliaMais]: 'The Bunny Garden',
    [NomeAcomodacao.SolteiroMais]: 'Single Bunny Premium',
    [NomeAcomodacao.FamiliaSuper]: 'Royal Burrow'
}

export const NOME_CURTO_ACOMODACAO: Record<NomeAcomodacao, string> = {
    [NomeAcomodacao.SolteiroSimples]: 'Solteiro Simples',
    [NomeAcomodacao.CasalSimples]: 'Casal Simples',
    [NomeAcomodacao.FamiliaSimples]: 'Família Simples',
    [NomeAcomodacao.FamiliaMais]: 'Família Mais',
    [NomeAcomodacao.SolteiroMais]: 'Solteiro Mais',
    [NomeAcomodacao.FamiliaSuper]: 'Família Super'
}

export interface Documento {
    numero: string;
    tipo: TipoDocumento;
    dataExpedicao: string;
}

export interface Endereco {
    rua: string;
    bairro: string;
    cidade: string;
    estado: string;
    pais: string;
    codigoPostal: string;
}

export interface Telefone {
    ddd: string;
    numero: string;
}

export interface Cliente {
    codigo: string;
    nome: string;
    nomeSocial: string;
    dataNascimento: string;
    dataCadastro: string;
    telefones: Telefone[];
    endereco: Endereco;
    documentos: Documento[];
    dependentes: string[];
    codigoTitular?: string;
    foto: string;
}

export interface Acomodacao {
    codigo: string;
    nomeAcomodacao: NomeAcomodacao;
    camaSolteiro: number;
    camaCasal: number;
    suite: number;
    climatizacao: boolean;
    garagem: number;
}

export interface Hospedagem {
    codigo: string;
    codigoCliente: string;
    codigoAcomodacao: string;
    dataCheckIn: string;
}
