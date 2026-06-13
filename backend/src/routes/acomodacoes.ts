import { Router, Request, Response } from 'express';
import { getPool } from '../database';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
    const [rows] = await getPool().execute(`
        SELECT codigo,
               nome_acomodacao AS nomeAcomodacao,
               cama_solteiro   AS camaSolteiro,
               cama_casal      AS camaCasal,
               suite,
               climatizacao,
               garagem
        FROM acomodacoes
    `);

    const acomodacoes = (rows as any[]).map(r => ({
        ...r,
        climatizacao: r.climatizacao === 1,
    }));

    res.json(acomodacoes);
});

export default router;