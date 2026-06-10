import { Router, Request, Response } from 'express';
import { getDb } from '../database';

const router = Router();

// GET /acomodacoes
router.get('/', (_req: Request, res: Response) => {
    const result = getDb().exec(`
    SELECT codigo, nome_acomodacao as nomeAcomodacao,
           cama_solteiro as camaSolteiro, cama_casal as camaCasal,
           suite, climatizacao, garagem
    FROM acomodacoes
  `);

    if (!result.length) return res.json([]);

    const { columns, values } = result[0];
    const rows = values.map((row: any[]) => {
        const obj: any = Object.fromEntries(columns.map((col: string, i: number) => [col, row[i]]));
        obj.climatizacao = obj.climatizacao === 1;
        return obj;
    });

    res.json(rows);
});

export default router;