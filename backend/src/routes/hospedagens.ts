import { Router, Request, Response } from 'express';
import { getPool } from '../database';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
    const [rows] = await getPool().execute(
        'SELECT codigo, codigo_cliente AS codigoCliente, codigo_acomodacao AS codigoAcomodacao, data_check_in AS dataCheckIn FROM hospedagens ORDER BY data_check_in DESC'
    );
    res.json(rows);
});

router.post('/', async (req: Request, res: Response) => {
    const { codigo, codigoCliente, codigoAcomodacao, dataCheckIn } = req.body;

    if (!codigo || !codigoCliente || !codigoAcomodacao || !dataCheckIn)
        return res.status(400).json({ erro: 'Campos obrigatórios: codigo, codigoCliente, codigoAcomodacao, dataCheckIn' });

    const pool = getPool();

    const [hospExiste] = await pool.execute('SELECT codigo FROM hospedagens WHERE codigo = ?', [codigo]);
    if ((hospExiste as any[]).length > 0)
        return res.status(409).json({ erro: 'Código já cadastrado' });

    const [clienteExiste] = await pool.execute('SELECT codigo FROM clientes WHERE codigo = ?', [codigoCliente]);
    if ((clienteExiste as any[]).length === 0)
        return res.status(400).json({ erro: 'Hóspede não encontrado' });

    const [acomExiste] = await pool.execute('SELECT codigo FROM acomodacoes WHERE codigo = ?', [codigoAcomodacao]);
    if ((acomExiste as any[]).length === 0)
        return res.status(400).json({ erro: 'Acomodação não encontrada' });

    await pool.execute(
        'INSERT INTO hospedagens (codigo, codigo_cliente, codigo_acomodacao, data_check_in) VALUES (?, ?, ?, ?)',
        [codigo, codigoCliente, codigoAcomodacao, dataCheckIn]
    );

    res.status(201).json({ codigo, codigoCliente, codigoAcomodacao, dataCheckIn });
});

router.delete('/:codigo', async (req: Request, res: Response) => {
    const { codigo } = req.params;

    const [rows] = await getPool().execute('SELECT codigo FROM hospedagens WHERE codigo = ?', [codigo]);
    if ((rows as any[]).length === 0)
        return res.status(404).json({ erro: 'Hospedagem não encontrada' });

    await getPool().execute('DELETE FROM hospedagens WHERE codigo = ?', [codigo]);
    res.status(204).send();
});

export default router;