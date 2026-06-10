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

// GET /hospedagens
router.get('/', (_req: Request, res: Response) => {
    const rows = toRows(getDb().exec(
        'SELECT codigo, codigo_cliente as codigoCliente, codigo_acomodacao as codigoAcomodacao, data_check_in as dataCheckIn FROM hospedagens ORDER BY data_check_in DESC'
    ));
    res.json(rows);
});

// POST /hospedagens
router.post('/', (req: Request, res: Response) => {
    const { codigo, codigoCliente, codigoAcomodacao, dataCheckIn } = req.body;

    if (!codigo || !codigoCliente || !codigoAcomodacao || !dataCheckIn) {
        return res.status(400).json({ erro: 'Campos obrigatórios: codigo, codigoCliente, codigoAcomodacao, dataCheckIn' });
    }

    if (getOne('SELECT codigo FROM hospedagens WHERE codigo=?', [codigo]))
        return res.status(409).json({ erro: 'Código já cadastrado' });

    if (!getOne('SELECT codigo FROM clientes WHERE codigo=?', [codigoCliente]))
        return res.status(400).json({ erro: 'Hóspede não encontrado' });

    if (!getOne('SELECT codigo FROM acomodacoes WHERE codigo=?', [codigoAcomodacao]))
        return res.status(400).json({ erro: 'Acomodação não encontrada' });

    getDb().run(
        'INSERT INTO hospedagens (codigo, codigo_cliente, codigo_acomodacao, data_check_in) VALUES (?,?,?,?)',
        [codigo, codigoCliente, codigoAcomodacao, dataCheckIn]
    );

    salvar();
    res.status(201).json({ codigo, codigoCliente, codigoAcomodacao, dataCheckIn });
});

// DELETE /hospedagens/:codigo
router.delete('/:codigo', (req: Request, res: Response) => {
    const { codigo } = req.params;
    if (!getOne('SELECT codigo FROM hospedagens WHERE codigo=?', [codigo]))
        return res.status(404).json({ erro: 'Hospedagem não encontrada' });

    getDb().run('DELETE FROM hospedagens WHERE codigo=?', [codigo]);
    salvar();
    res.status(204).send();
});

export default router;