import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT) ?? 3306,
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'atlantis',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
});

export const getPool = () => pool;

export const inicializar = async (): Promise<void> => {
    const conn = await pool.getConnection();
    conn.release();
    console.log('Conexão com MySQL estabelecida.');
};