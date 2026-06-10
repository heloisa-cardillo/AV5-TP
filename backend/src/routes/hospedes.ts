import { Router, Request, Response } from 'express';
import { getDb, salvar } from '../database';

const router = Router();

const toRows = (res: any[]): any[] => {
    if (!res.length) return [];
    const { columns, values } = res[0];
    return values.map((row: any[]) =>
        Object.fromEntries(columns.map((col: string, i: number) => [col, row[i]]))
    );
};

const getOne = (sql: string, params: any[] = []): any | null => {
    const rows = toRows(getDb().exec(sql, params));
    return rows[0] ?? null;
};

const getAll = (sql: string, params: any[] = []): any[] => {
    return toRows(getDb().exec(sql, params));
};

const montarCliente = (codigo: string) => {
    const cliente = getOne('SELECT * FROM clientes WHERE codigo = ?', [codigo]);
    if (!cliente) return null;

    const endereco = getOne('SELECT * FROM enderecos WHERE codigo_cliente = ?', [codigo]);
    const telefones = getAll('SELECT ddd, numero FROM telefones WHERE codigo_cliente = ?', [codigo]);
    const documentos = getAll('SELECT numero, tipo, data_expedicao as dataExpedicao FROM documentos WHERE codigo_cliente = ?', [codigo]);
    const dependentes = getAll('SELECT codigo FROM clientes WHERE codigo_titular = ?', [codigo]);

    return {
        codigo,
        nome: cliente.nome,
        nomeSocial: cliente.nome_social,
        dataNascimento: cliente.data_nasc,
        dataCadastro: cliente.data_cadastro,
        codigoTitular: cliente.codigo_titular ?? undefined,
        foto: cliente.foto ?? '',
        endereco: endereco ? {
            rua: endereco.rua,
            bairro: endereco.bairro,
            cidade: endereco.cidade,
            estado: endereco.estado,
            pais: endereco.pais,
            codigoPostal: endereco.codigo_postal,
        } : {},
        telefones,
        documentos,
        dependentes: dependentes.map((d: any) => d.codigo),
    };
};

// GET /hospedes
router.get('/', (_req: Request, res: Response) => {
    const rows = getAll('SELECT codigo FROM clientes');
    const clientes = rows.map(r => montarCliente(r.codigo)).filter(Boolean);
    res.json(clientes);
});

// GET /hospedes/:codigo
router.get('/:codigo', (req: Request, res: Response) => {
    const cliente = montarCliente(req.params.codigo);
    if (!cliente) return res.status(404).json({ erro: 'Hóspede não encontrado' });
    res.json(cliente);
});

// POST /hospedes
router.post('/', (req: Request, res: Response) => {
    const { codigo, nome, nomeSocial, dataNascimento, dataCadastro, codigoTitular, foto,
        endereco, telefones, documentos } = req.body;

    if (!codigo || !nome || !nomeSocial || !dataNascimento) {
        return res.status(400).json({ erro: 'Campos obrigatórios: codigo, nome, nomeSocial, dataNascimento' });
    }

    const existente = getOne('SELECT codigo FROM clientes WHERE codigo = ?', [codigo]);
    if (existente) return res.status(409).json({ erro: 'Código já cadastrado' });

    const db = getDb();
    db.run(
        'INSERT INTO clientes (codigo, nome, nome_social, data_nasc, data_cadastro, codigo_titular, foto) VALUES (?,?,?,?,?,?,?)',
        [codigo, nome, nomeSocial, dataNascimento,
            dataCadastro ?? new Date().toISOString().split('T')[0],
            codigoTitular ?? null, foto ?? '']
    );

    if (endereco) {
        db.run(
            'INSERT INTO enderecos (codigo_cliente, rua, bairro, cidade, estado, pais, codigo_postal) VALUES (?,?,?,?,?,?,?)',
            [codigo, endereco.rua, endereco.bairro, endereco.cidade, endereco.estado, endereco.pais, endereco.codigoPostal]
        );
    }

    if (telefones?.length) {
        for (const t of telefones)
            db.run('INSERT INTO telefones (codigo_cliente, ddd, numero) VALUES (?,?,?)', [codigo, t.ddd, t.numero]);
    }

    if (documentos?.length) {
        for (const d of documentos)
            db.run('INSERT INTO documentos (codigo_cliente, numero, tipo, data_expedicao) VALUES (?,?,?,?)',
                [codigo, d.numero, d.tipo, d.dataExpedicao]);
    }

    salvar();
    res.status(201).json(montarCliente(codigo));
});

// PUT /hospedes/:codigo — aceita atualização parcial
router.put('/:codigo', (req: Request, res: Response) => {
    const { codigo } = req.params;
    const { nome, nomeSocial, dataNascimento, foto, endereco, telefones, documentos } = req.body;

    const atual = getOne('SELECT * FROM clientes WHERE codigo = ?', [codigo]);
    if (!atual) return res.status(404).json({ erro: 'Hóspede não encontrado' });

    const db = getDb();

    // Atualiza campos básicos apenas se foram enviados
    const novoNome = nome ?? atual.nome;
    const novoSocial = nomeSocial ?? atual.nome_social;
    const novaDataNasc = dataNascimento ?? atual.data_nasc;
    const novaFoto = foto ?? atual.foto ?? '';

    db.run('UPDATE clientes SET nome=?, nome_social=?, data_nasc=?, foto=? WHERE codigo=?',
        [novoNome, novoSocial, novaDataNasc, novaFoto, codigo]);

    if (endereco !== undefined) {
        const endExiste = getOne('SELECT codigo_cliente FROM enderecos WHERE codigo_cliente = ?', [codigo]);
        if (endExiste) {
            db.run('UPDATE enderecos SET rua=?, bairro=?, cidade=?, estado=?, pais=?, codigo_postal=? WHERE codigo_cliente=?',
                [endereco.rua, endereco.bairro, endereco.cidade, endereco.estado, endereco.pais, endereco.codigoPostal, codigo]);
        } else {
            db.run('INSERT INTO enderecos (codigo_cliente, rua, bairro, cidade, estado, pais, codigo_postal) VALUES (?,?,?,?,?,?,?)',
                [codigo, endereco.rua, endereco.bairro, endereco.cidade, endereco.estado, endereco.pais, endereco.codigoPostal]);
        }
    }

    if (telefones !== undefined) {
        db.run('DELETE FROM telefones WHERE codigo_cliente=?', [codigo]);
        for (const t of telefones)
            db.run('INSERT INTO telefones (codigo_cliente, ddd, numero) VALUES (?,?,?)', [codigo, t.ddd, t.numero]);
    }

    if (documentos !== undefined) {
        db.run('DELETE FROM documentos WHERE codigo_cliente=?', [codigo]);
        for (const d of documentos)
            db.run('INSERT INTO documentos (codigo_cliente, numero, tipo, data_expedicao) VALUES (?,?,?,?)',
                [codigo, d.numero, d.tipo, d.dataExpedicao]);
    }

    salvar();
    res.json(montarCliente(codigo));
});

// DELETE /hospedes/:codigo
router.delete('/:codigo', (req: Request, res: Response) => {
    const { codigo } = req.params;
    const existente = getOne('SELECT codigo FROM clientes WHERE codigo = ?', [codigo]);
    if (!existente) return res.status(404).json({ erro: 'Hóspede não encontrado' });

    const db = getDb();
    const dependentes = getAll('SELECT codigo FROM clientes WHERE codigo_titular=?', [codigo]);

    for (const dep of dependentes) {
        db.run('DELETE FROM hospedagens WHERE codigo_cliente=?', [dep.codigo]);
        db.run('DELETE FROM clientes WHERE codigo=?', [dep.codigo]);
    }
    db.run('DELETE FROM hospedagens WHERE codigo_cliente=?', [codigo]);
    db.run('DELETE FROM clientes WHERE codigo=?', [codigo]);

    salvar();
    res.status(204).send();
});

export default router;