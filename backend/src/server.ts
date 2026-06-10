import express from 'express';
import cors from 'cors';
import { inicializar } from './database';
import hospedesRouter from './routes/hospedes';
import hospedagensRouter from './routes/hospedagens';
import acomodacoesRouter from './routes/acomodacoes';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/hospedes', hospedesRouter);
app.use('/hospedagens', hospedagensRouter);
app.use('/acomodacoes', acomodacoesRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Inicializa o banco antes de subir o servidor
inicializar().then(() => {
    app.listen(PORT, () => {
        console.log(`Atlantis backend rodando em http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Erro ao inicializar banco:', err);
    process.exit(1);
});