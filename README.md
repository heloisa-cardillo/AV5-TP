# Atlantis

Interface web completa do sistema Atlantis, desenvolvida com React + TypeScript + Vite no frontend e Node.js + Express + MySQL no backend. Esta é a AV5 da disciplina de Tecnologia de Programação da FATEC São José dos Campos, evolução da SPA desenvolvida na AV4.

## Pré-requisitos

- Node.js instalado
- MySQL instalado e rodando

## Configuração do banco de dados

**1. Acesse o MySQL**

Windows:
```powershell
mysql -u root -p
```

Linux:
```bash
mysql -u root -p
```

**2. Rode o script SQL**

Windows:
```powershell
Get-Content backend\atlantis.sql | mysql -u root -p
```

Linux:
```bash
mysql -u root -p < backend/atlantis.sql
```

Isso criará o banco `atlantis` com todas as tabelas e dados iniciais.

## Configuração do ambiente

Crie o arquivo `backend/.env` com base no `backend/.env.example`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=atlantis
```

## Como rodar

**1. Backend (em um terminal)**

```bash
cd backend
npm install
npm run dev
```

O backend estará disponível em `http://localhost:3001`.

**2. Frontend (em outro terminal)**

```bash
npm install
npm run dev
```

O sistema estará disponível em `http://localhost:5173`.

> O backend precisa estar rodando antes de acessar o frontend.

## Tecnologias utilizadas

**Frontend**
- React 19
- TypeScript
- Vite

**Backend**
- Node.js
- Express
- TypeScript
- MySQL2

## Funcionalidades

- Cadastro, edição e exclusão de hóspedes (titulares e dependentes)
- Gerenciamento de documentos por hóspede
- Registro e exclusão de hospedagens (check-in)
- Visualização das acomodações disponíveis
- Dados persistidos em banco de dados MySQL