import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

const config = {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    charset: 'utf8mb4',
};

const pool = mysql.createPool({
    ...config,
    database: process.env.DB_NAME ?? 'atlantis',
    waitForConnections: true,
    connectionLimit: 10,
});

export const getPool = () => pool;

// Cria o banco, as tabelas e os dados iniciais automaticamente (idempotente).
export const inicializar = async (): Promise<void> => {
    const conn = await mysql.createConnection({ ...config, multipleStatements: true });
    await conn.query("SET NAMES utf8mb4");
    try {
        const script = readFileSync(join(__dirname, '..', 'atlantis.sql'), 'utf8');
        await conn.query(script);
        console.log('Banco verificado/criado automaticamente com sucesso.');
    } finally {
        await conn.end();
    }
};