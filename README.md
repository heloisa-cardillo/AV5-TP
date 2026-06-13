# Atlantis

Aplicação web do sistema Atlantis — React + TypeScript + Vite no frontend e Node.js + Express + MySQL no backend.

## Pré-requisitos

- Node.js
- MySQL rodando

## Como rodar

**1. Configure o banco no `.env`**

Abra o arquivo `backend/.env` e coloque a senha do seu MySQL no campo `DB_PASSWORD`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=SUA SENHA
DB_NAME=atlantis
```

**2. Backend** (em um terminal)

**O backend precisa estar rodando antes de acessar o frontend.**

```bash
cd backend
npm install
npm run dev
```
O banco `atlantis`, as tabelas e os dados iniciais são criados automaticamente na primeira execução. Backend disponível em `http://localhost:3001`.

**3. Frontend** (em outro terminal, na raiz do projeto)
```bash
npm install
npm run dev
```
Sistema disponível em `http://localhost:5173`.
