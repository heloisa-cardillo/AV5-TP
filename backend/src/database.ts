import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'atlantis.db');

let db: Database | null = null;

export const getDb = (): Database => {
    if (!db) throw new Error('Banco de dados não inicializado');
    return db;
};

export const salvar = () => {
    if (!db) return;
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
};

export const inicializar = async (): Promise<void> => {
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      codigo         TEXT PRIMARY KEY,
      nome           TEXT NOT NULL,
      nome_social    TEXT NOT NULL,
      data_nasc      TEXT NOT NULL,
      data_cadastro  TEXT NOT NULL,
      codigo_titular TEXT,
      foto           TEXT
    );
    CREATE TABLE IF NOT EXISTS enderecos (
      codigo_cliente TEXT PRIMARY KEY,
      rua            TEXT NOT NULL,
      bairro         TEXT NOT NULL,
      cidade         TEXT NOT NULL,
      estado         TEXT NOT NULL,
      pais           TEXT NOT NULL,
      codigo_postal  TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS telefones (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo_cliente TEXT NOT NULL,
      ddd            TEXT NOT NULL,
      numero         TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS documentos (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo_cliente TEXT NOT NULL,
      numero         TEXT NOT NULL,
      tipo           TEXT NOT NULL,
      data_expedicao TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS acomodacoes (
      codigo          TEXT PRIMARY KEY,
      nome_acomodacao TEXT NOT NULL,
      cama_solteiro   INTEGER NOT NULL,
      cama_casal      INTEGER NOT NULL,
      suite           INTEGER NOT NULL,
      climatizacao    INTEGER NOT NULL,
      garagem         INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS hospedagens (
      codigo            TEXT PRIMARY KEY,
      codigo_cliente    TEXT NOT NULL,
      codigo_acomodacao TEXT NOT NULL,
      data_check_in     TEXT NOT NULL
    );
  `);

    seedAcomodacoes();
    seedDadosIniciais();
    salvar();

    console.log('Banco de dados inicializado em', DB_PATH);
};

const seedAcomodacoes = () => {
    const res = db!.exec('SELECT COUNT(*) as c FROM acomodacoes');
    const count = res[0]?.values[0][0] as number;
    if (count > 0) return;

    const acomodacoes = [
        ['ACOM001', 'Acomodação simples para solteiro(a)', 1, 0, 1, 1, 0],
        ['ACOM002', 'Acomodação simples para casal', 0, 1, 1, 1, 1],
        ['ACOM003', 'Acomodação para família com até duas crianças', 2, 1, 1, 1, 1],
        ['ACOM004', 'Acomodação para família com até cinco crianças', 5, 1, 2, 1, 2],
        ['ACOM005', 'Acomodação com garagem para solteiro(a)', 0, 1, 1, 1, 1],
        ['ACOM006', 'Acomodação para até duas famílias, casal e três crianças cada', 6, 2, 3, 1, 2],
    ];

    for (const a of acomodacoes) {
        db!.run(
            'INSERT INTO acomodacoes (codigo, nome_acomodacao, cama_solteiro, cama_casal, suite, climatizacao, garagem) VALUES (?,?,?,?,?,?,?)',
            a
        );
    }
};

const seedDadosIniciais = () => {
    const res = db!.exec('SELECT COUNT(*) as c FROM clientes');
    const count = res[0]?.values[0][0] as number;
    if (count > 0) return;

    const enderecoPadrao = ['Rua Engenheiro Jose Longo, 622', 'Jardim Aquarius', 'São José dos Campos', 'SP', 'Brasil', '12246-000'];

    const insCliente = (codigo: string, nome: string, nomeSocial: string, dataNasc: string, dataCad: string, titular: string | null, foto: string) => {
        db!.run('INSERT INTO clientes (codigo, nome, nome_social, data_nasc, data_cadastro, codigo_titular, foto) VALUES (?,?,?,?,?,?,?)',
            [codigo, nome, nomeSocial, dataNasc, dataCad, titular, foto]);
    };
    const insEndereco = (codigo: string) => {
        db!.run('INSERT INTO enderecos (codigo_cliente, rua, bairro, cidade, estado, pais, codigo_postal) VALUES (?,?,?,?,?,?,?)',
            [codigo, ...enderecoPadrao]);
    };
    const insTelefone = (codigo: string, ddd: string, numero: string) => {
        db!.run('INSERT INTO telefones (codigo_cliente, ddd, numero) VALUES (?,?,?)', [codigo, ddd, numero]);
    };
    const insDoc = (codigo: string, numero: string, tipo: string, dataExp: string) => {
        db!.run('INSERT INTO documentos (codigo_cliente, numero, tipo, data_expedicao) VALUES (?,?,?,?)', [codigo, numero, tipo, dataExp]);
    };

    insCliente('HSP001', 'José Ricardo', 'O coelho audacioso', '1985-03-10', '2024-01-15', null, '/imagens/jose.png');
    insEndereco('HSP001'); insTelefone('HSP001', '12', '11111-1111');
    insDoc('HSP001', '111.111.111-11', 'Cadastro de Pessoa Física', '2005-01-01');
    insDoc('HSP001', '11.111.111-1', 'Registro Geral', '2004-06-15');

    insCliente('HSP002', 'Daniele', 'A coelha carinhosa', '1990-07-22', '2024-01-15', 'HSP001', '/imagens/dani.png');
    insEndereco('HSP002'); insTelefone('HSP002', '12', '22222-2222');
    insDoc('HSP002', '222.222.222-22', 'Cadastro de Pessoa Física', '2008-03-10');
    insDoc('HSP002', '22.222.222-2', 'Registro Geral', '2007-11-20');

    insCliente('HSP003', 'Amy', 'A coelha exploradora', '1992-11-05', '2024-02-01', null, '/imagens/amy.png');
    insEndereco('HSP003'); insTelefone('HSP003', '12', '33333-3333');
    insDoc('HSP003', '333.333.333-33', 'Cadastro de Pessoa Física', '2010-05-15');

    insCliente('HSP004', 'Frida', 'A coelha leal', '1988-04-18', '2024-02-10', null, '/imagens/frida.png');
    insEndereco('HSP004'); insTelefone('HSP004', '12', '44444-4444');
    insDoc('HSP004', '444.444.444-44', 'Cadastro de Pessoa Física', '2006-09-30');
    insDoc('HSP004', '44.444.444-4', 'Registro Geral', '2005-12-01');

    insCliente('HSP005', 'Hanna', 'A coelha gentil', '1995-09-30', '2024-03-05', null, '/imagens/hanna.png');
    insEndereco('HSP005'); insTelefone('HSP005', '12', '55555-5555');
    insDoc('HSP005', '555.555.555-55', 'Cadastro de Pessoa Física', '2013-07-22');

    db!.run('INSERT INTO hospedagens (codigo, codigo_cliente, codigo_acomodacao, data_check_in) VALUES (?,?,?,?)',
        ['HOS001', 'HSP001', 'ACOM002', '2024-12-01']);
    db!.run('INSERT INTO hospedagens (codigo, codigo_cliente, codigo_acomodacao, data_check_in) VALUES (?,?,?,?)',
        ['HOS002', 'HSP003', 'ACOM001', '2024-12-03']);
    db!.run('INSERT INTO hospedagens (codigo, codigo_cliente, codigo_acomodacao, data_check_in) VALUES (?,?,?,?)',
        ['HOS003', 'HSP004', 'ACOM005', '2024-12-05']);
};