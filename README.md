# Atlantis

Interface web completa do sistema Atlantis, desenvolvida com React + TypeScript + Vite no frontend e Node.js + Express + SQLite no backend. Esta é a AV5 da disciplina de Tecnologia de Programação da FATEC São José dos Campos, evolução da SPA desenvolvida na AV4.

## Como rodar

**Pré-requisitos**
- Node.js instalado
- npm instalado

**1. Backend (API + Banco de dados)**

```bash
cd backend
npm install
npm run dev
```

O backend estará disponível em `http://localhost:3001`.

**2. Frontend (em outro terminal)**

```bash
# Na raiz do projeto
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
- sql.js (SQLite)

## Funcionalidades

- Cadastro, edição e exclusão de hóspedes (titulares e dependentes)
- Gerenciamento de documentos por hóspede
- Registro e exclusão de hospedagens (check-in)
- Visualização das acomodações disponíveis
- Dados persistidos em banco de dados SQLite