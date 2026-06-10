import { Router, Request, Response } from 'express';
import db from '../database';

const router = Router();

// Monta objeto Cliente completo a partir do banco
const montarCliente = (codigo: string) => {
    const cliente = db.prepare('SELECT * FROM clientes WHERE codigo = ?').get(codigo) as any;
    if (!cliente) return null;

    const endereco = db.prepare('SELECT * FROM enderecos  WHERE codigo_cliente = ?').get(codigo) as any;
    const telefones = db.prepare('SELECT ddd, numero FROM telefones  WHERE codigo_cliente = ?').all(codigo) as any[];
    const documentos = db.prepare('SELECT numero, tipo, data_expedicao as dataExpedicao FROM documentos WHERE codigo_cliente = ?').all(codigo) as any[];
    const dependentes = db.prepare('SELECT codigo FROM clientes WHERE codigo_titular = ?').all(codigo) as any[];

    return {
        codigo: cliente.codigo,
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
    const rows = db.prepare('SELECT codigo FROM clientes').all() as { codigo: string }[];
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

    const existente = db.prepare('SELECT codigo FROM clientes WHERE codigo = ?').get(codigo);
    if (existente) return res.status(409).json({ erro: 'Código já cadastrado' });

    const inserir = db.transaction(() => {
        db.prepare(`
      INSERT INTO clientes (codigo, nome, nome_social, data_nasc, data_cadastro, codigo_titular, foto)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(codigo, nome, nomeSocial, dataNascimento, dataCadastro ?? new Date().toISOString().split('T')[0],
            codigoTitular ?? null, foto ?? '');

        if (endereco) {
            db.prepare(`
        INSERT INTO enderecos (codigo_cliente, rua, bairro, cidade, estado, pais, codigo_postal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(codigo, endereco.rua, endereco.bairro, endereco.cidade,
                endereco.estado, endereco.pais, endereco.codigoPostal);
        }

        if (telefones?.length) {
            const stmt = db.prepare('INSERT INTO telefones (codigo_cliente, ddd, numero) VALUES (?, ?, ?)');
            for (const t of telefones) stmt.run(codigo, t.ddd, t.numero);
        }

        if (documentos?.length) {
            const stmt = db.prepare('INSERT INTO documentos (codigo_cliente, numero, tipo, data_expedicao) VALUES (?, ?, ?, ?)');
            for (const d of documentos) stmt.run(codigo, d.numero, d.tipo, d.dataExpedicao);
        }
    });

    inserir();
    res.status(201).json(montarCliente(codigo));
});

// PUT /hospedes/:codigo
router.put('/:codigo', (req: Request, res: Response) => {
    const { codigo } = req.params;
    const { nome, nomeSocial, dataNascimento, foto, endereco, telefones, documentos } = req.body;

    const existente = db.prepare('SELECT codigo FROM clientes WHERE codigo = ?').get(codigo);
    if (!existente) return res.status(404).json({ erro: 'Hóspede não encontrado' });

    const atualizar = db.transaction(() => {
        db.prepare(`
      UPDATE clientes SET nome = ?, nome_social = ?, data_nasc = ?, foto = ? WHERE codigo = ?
    `).run(nome, nomeSocial, dataNascimento, foto ?? '', codigo);

        if (endereco) {
            const endExiste = db.prepare('SELECT codigo_cliente FROM enderecos WHERE codigo_cliente = ?').get(codigo);
            if (endExiste) {
                db.prepare(`
          UPDATE enderecos SET rua=?, bairro=?, cidade=?, estado=?, pais=?, codigo_postal=?
          WHERE codigo_cliente=?
        `).run(endereco.rua, endereco.bairro, endereco.cidade, endereco.estado,
                    endereco.pais, endereco.codigoPostal, codigo);
            } else {
                db.prepare(`
          INSERT INTO enderecos (codigo_cliente, rua, bairro, cidade, estado, pais, codigo_postal)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(codigo, endereco.rua, endereco.bairro, endereco.cidade,
                    endereco.estado, endereco.pais, endereco.codigoPostal);
            }
        }

        if (telefones !== undefined) {
            db.prepare('DELETE FROM telefones WHERE codigo_cliente = ?').run(codigo);
            const stmt = db.prepare('INSERT INTO telefones (codigo_cliente, ddd, numero) VALUES (?, ?, ?)');
            for (const t of telefones) stmt.run(codigo, t.ddd, t.numero);
        }

        if (documentos !== undefined) {
            db.prepare('DELETE FROM documentos WHERE codigo_cliente = ?').run(codigo);
            const stmt = db.prepare('INSERT INTO documentos (codigo_cliente, numero, tipo, data_expedicao) VALUES (?, ?, ?, ?)');
            for (const d of documentos) stmt.run(codigo, d.numero, d.tipo, d.dataExpedicao);
        }
    });

    atualizar();
    res.json(montarCliente(codigo));
});

// DELETE /hospedes/:codigo
router.delete('/:codigo', (req: Request, res: Response) => {
    const { codigo } = req.params;
    const existente = db.prepare('SELECT codigo FROM clientes WHERE codigo = ?').get(codigo);
    if (!existente) return res.status(404).json({ erro: 'Hóspede não encontrado' });

    // Remove dependentes primeiro
    const dependentes = db.prepare('SELECT codigo FROM clientes WHERE codigo_titular = ?').all(codigo) as { codigo: string }[];
    const deletar = db.transaction(() => {
        for (const dep of dependentes) {
            db.prepare('DELETE FROM hospedagens WHERE codigo_cliente = ?').run(dep.codigo);
            db.prepare('DELETE FROM clientes WHERE codigo = ?').run(dep.codigo);
        }
        db.prepare('DELETE FROM hospedagens WHERE codigo_cliente = ?').run(codigo);
        db.prepare('DELETE FROM clientes WHERE codigo = ?').run(codigo);
    });

    deletar();
    res.status(204).send();
});

export default router;