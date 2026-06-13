import { Router, Request, Response } from 'express';
import { getPool } from '../database';

const router = Router();

const montarCliente = async (codigo: string): Promise<any | null> => {
    const pool = getPool();

    const [clientes] = await pool.execute('SELECT * FROM clientes WHERE codigo = ?', [codigo]);
    const cliente = (clientes as any[])[0];
    if (!cliente) return null;

    const [enderecos] = await pool.execute('SELECT * FROM enderecos WHERE codigo_cliente = ?', [codigo]);
    const endereco = (enderecos as any[])[0];

    const [telefones] = await pool.execute('SELECT ddd, numero FROM telefones WHERE codigo_cliente = ?', [codigo]);

    const [documentos] = await pool.execute(
        'SELECT numero, tipo, data_expedicao AS dataExpedicao FROM documentos WHERE codigo_cliente = ?',
        [codigo]
    );

    const [dependentes] = await pool.execute('SELECT codigo FROM clientes WHERE codigo_titular = ?', [codigo]);

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
        dependentes: (dependentes as any[]).map((d: any) => d.codigo),
    };
};

// GET /hospedes
router.get('/', async (_req: Request, res: Response) => {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT codigo FROM clientes');
    const clientes = await Promise.all((rows as any[]).map(r => montarCliente(r.codigo)));
    res.json(clientes.filter(Boolean));
});

// GET /hospedes/:codigo
router.get('/:codigo', async (req: Request, res: Response) => {
    const cliente = await montarCliente(req.params.codigo);
    if (!cliente) return res.status(404).json({ erro: 'Hóspede não encontrado' });
    res.json(cliente);
});

// POST /hospedes
router.post('/', async (req: Request, res: Response) => {
    const { codigo, nome, nomeSocial, dataNascimento, dataCadastro, codigoTitular, foto,
        endereco, telefones, documentos } = req.body;

    if (!codigo || !nome || !nomeSocial || !dataNascimento)
        return res.status(400).json({ erro: 'Campos obrigatórios: codigo, nome, nomeSocial, dataNascimento' });

    const pool = getPool();

    const [existente] = await pool.execute('SELECT codigo FROM clientes WHERE codigo = ?', [codigo]);
    if ((existente as any[]).length > 0)
        return res.status(409).json({ erro: 'Código já cadastrado' });

    await pool.execute(
        'INSERT INTO clientes (codigo, nome, nome_social, data_nasc, data_cadastro, codigo_titular, foto) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [codigo, nome, nomeSocial, dataNascimento,
            dataCadastro ?? new Date().toISOString().split('T')[0],
            codigoTitular ?? null, foto ?? '']
    );

    if (endereco) {
        await pool.execute(
            'INSERT INTO enderecos (codigo_cliente, rua, bairro, cidade, estado, pais, codigo_postal) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [codigo, endereco.rua, endereco.bairro, endereco.cidade, endereco.estado, endereco.pais, endereco.codigoPostal]
        );
    }

    if (telefones?.length) {
        for (const t of telefones)
            await pool.execute('INSERT INTO telefones (codigo_cliente, ddd, numero) VALUES (?, ?, ?)', [codigo, t.ddd, t.numero]);
    }

    if (documentos?.length) {
        for (const d of documentos)
            await pool.execute(
                'INSERT INTO documentos (codigo_cliente, numero, tipo, data_expedicao) VALUES (?, ?, ?, ?)',
                [codigo, d.numero, d.tipo, d.dataExpedicao]
            );
    }

    res.status(201).json(await montarCliente(codigo));
});

// PUT /hospedes/:codigo
router.put('/:codigo', async (req: Request, res: Response) => {
    const { codigo } = req.params;
    const { nome, nomeSocial, dataNascimento, foto, endereco, telefones, documentos } = req.body;

    const pool = getPool();

    const [atual] = await pool.execute('SELECT * FROM clientes WHERE codigo = ?', [codigo]);
    const cliente = (atual as any[])[0];
    if (!cliente) return res.status(404).json({ erro: 'Hóspede não encontrado' });

    await pool.execute(
        'UPDATE clientes SET nome = ?, nome_social = ?, data_nasc = ?, foto = ? WHERE codigo = ?',
        [nome ?? cliente.nome, nomeSocial ?? cliente.nome_social, dataNascimento ?? cliente.data_nasc, foto ?? cliente.foto ?? '', codigo]
    );

    if (endereco !== undefined) {
        const [endExiste] = await pool.execute('SELECT codigo_cliente FROM enderecos WHERE codigo_cliente = ?', [codigo]);
        if ((endExiste as any[]).length > 0) {
            await pool.execute(
                'UPDATE enderecos SET rua = ?, bairro = ?, cidade = ?, estado = ?, pais = ?, codigo_postal = ? WHERE codigo_cliente = ?',
                [endereco.rua, endereco.bairro, endereco.cidade, endereco.estado, endereco.pais, endereco.codigoPostal, codigo]
            );
        } else {
            await pool.execute(
                'INSERT INTO enderecos (codigo_cliente, rua, bairro, cidade, estado, pais, codigo_postal) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [codigo, endereco.rua, endereco.bairro, endereco.cidade, endereco.estado, endereco.pais, endereco.codigoPostal]
            );
        }
    }

    if (telefones !== undefined) {
        await pool.execute('DELETE FROM telefones WHERE codigo_cliente = ?', [codigo]);
        for (const t of telefones)
            await pool.execute('INSERT INTO telefones (codigo_cliente, ddd, numero) VALUES (?, ?, ?)', [codigo, t.ddd, t.numero]);
    }

    if (documentos !== undefined) {
        await pool.execute('DELETE FROM documentos WHERE codigo_cliente = ?', [codigo]);
        for (const d of documentos)
            await pool.execute(
                'INSERT INTO documentos (codigo_cliente, numero, tipo, data_expedicao) VALUES (?, ?, ?, ?)',
                [codigo, d.numero, d.tipo, d.dataExpedicao]
            );
    }

    res.json(await montarCliente(codigo));
});

// DELETE /hospedes/:codigo
router.delete('/:codigo', async (req: Request, res: Response) => {
    const { codigo } = req.params;
    const pool = getPool();

    const [existente] = await pool.execute('SELECT codigo FROM clientes WHERE codigo = ?', [codigo]);
    if ((existente as any[]).length === 0)
        return res.status(404).json({ erro: 'Hóspede não encontrado' });

    const [dependentes] = await pool.execute('SELECT codigo FROM clientes WHERE codigo_titular = ?', [codigo]);
    for (const dep of dependentes as any[]) {
        await pool.execute('DELETE FROM clientes WHERE codigo = ?', [dep.codigo]);
    }

    await pool.execute('DELETE FROM clientes WHERE codigo = ?', [codigo]);

    res.status(204).send();
});

export default router;