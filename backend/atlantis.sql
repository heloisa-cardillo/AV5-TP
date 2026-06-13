SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

DROP DATABASE IF EXISTS atlantis;
CREATE DATABASE atlantis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE atlantis;

CREATE TABLE clientes (
  codigo         VARCHAR(20) PRIMARY KEY,
  nome           VARCHAR(255) NOT NULL,
  nome_social    VARCHAR(255) NOT NULL,
  data_nasc      VARCHAR(10) NOT NULL,
  data_cadastro  VARCHAR(10) NOT NULL,
  codigo_titular VARCHAR(20),
  foto           VARCHAR(500),
  FOREIGN KEY (codigo_titular) REFERENCES clientes(codigo) ON DELETE CASCADE
);

CREATE TABLE enderecos (
  codigo_cliente VARCHAR(20) PRIMARY KEY,
  rua            VARCHAR(255) NOT NULL,
  bairro         VARCHAR(255) NOT NULL,
  cidade         VARCHAR(255) NOT NULL,
  estado         VARCHAR(100) NOT NULL,
  pais           VARCHAR(100) NOT NULL,
  codigo_postal  VARCHAR(20) NOT NULL,
  FOREIGN KEY (codigo_cliente) REFERENCES clientes(codigo) ON DELETE CASCADE
);

CREATE TABLE telefones (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  codigo_cliente VARCHAR(20) NOT NULL,
  ddd            VARCHAR(3) NOT NULL,
  numero         VARCHAR(20) NOT NULL,
  UNIQUE KEY uq_telefone (codigo_cliente, numero),
  FOREIGN KEY (codigo_cliente) REFERENCES clientes(codigo) ON DELETE CASCADE
);

CREATE TABLE documentos (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  codigo_cliente VARCHAR(20) NOT NULL,
  numero         VARCHAR(50) NOT NULL,
  tipo           VARCHAR(50) NOT NULL,
  data_expedicao VARCHAR(10) NOT NULL,
  UNIQUE KEY uq_documento (codigo_cliente, numero),
  FOREIGN KEY (codigo_cliente) REFERENCES clientes(codigo) ON DELETE CASCADE
);

CREATE TABLE acomodacoes (
  codigo          VARCHAR(20) PRIMARY KEY,
  nome_acomodacao VARCHAR(255) NOT NULL,
  cama_solteiro   INT NOT NULL,
  cama_casal      INT NOT NULL,
  suite           INT NOT NULL,
  climatizacao    TINYINT(1) NOT NULL,
  garagem         INT NOT NULL
);

CREATE TABLE hospedagens (
  codigo            VARCHAR(20) PRIMARY KEY,
  codigo_cliente    VARCHAR(20) NOT NULL,
  codigo_acomodacao VARCHAR(20) NOT NULL,
  data_check_in     VARCHAR(10) NOT NULL,
  FOREIGN KEY (codigo_cliente) REFERENCES clientes(codigo) ON DELETE CASCADE,
  FOREIGN KEY (codigo_acomodacao) REFERENCES acomodacoes(codigo)
);

-- Acomodações
INSERT INTO acomodacoes VALUES
('ACOM001','Acomodação simples para solteiro(a)',1,0,1,1,0),
('ACOM002','Acomodação simples para casal',0,1,1,1,1),
('ACOM003','Acomodação para família com até duas crianças',2,1,1,1,1),
('ACOM004','Acomodação para família com até cinco crianças',5,1,2,1,2),
('ACOM005','Acomodação com garagem para solteiro(a)',0,1,1,1,1),
('ACOM006','Acomodação para até duas famílias, casal e três crianças cada',6,2,3,1,2);

-- Clientes
INSERT INTO clientes VALUES
('HSP001','José Ricardo','O coelho audacioso','1985-03-10','2024-01-15',NULL,'/imagens/jose.png'),
('HSP002','Daniele','A coelha carinhosa','1990-07-22','2024-01-15','HSP001','/imagens/dani.png'),
('HSP003','Amy','A coelha exploradora','1992-11-05','2024-02-01',NULL,'/imagens/amy.png'),
('HSP004','Frida','A coelha leal','1988-04-18','2024-02-10',NULL,'/imagens/frida.png'),
('HSP005','Hanna','A coelha gentil','1995-09-30','2024-03-05',NULL,'/imagens/hanna.png');

-- Endereços
INSERT INTO enderecos VALUES
('HSP001','Rua Engenheiro Jose Longo, 622','Jardim Aquarius','São José dos Campos','SP','Brasil','12246-000'),
('HSP002','Rua Engenheiro Jose Longo, 622','Jardim Aquarius','São José dos Campos','SP','Brasil','12246-000'),
('HSP003','Rua Vilaça, 390','Vila Adyana','São José dos Campos','SP','Brasil','12243-020'),
('HSP004','Av. Dr. João Guilhermino, 55','Centro','São José dos Campos','SP','Brasil','12210-130'),
('HSP005','Rua Felício Savastano, 200','Vila Industrial','São José dos Campos','SP','Brasil','12220-490');

-- Telefones
INSERT INTO telefones (codigo_cliente, ddd, numero) VALUES
('HSP001','12','11111-1111'),
('HSP002','12','22222-2222'),
('HSP003','12','33333-3333'),
('HSP004','12','44444-4444'),
('HSP005','12','55555-5555');

-- Documentos
INSERT INTO documentos (codigo_cliente, numero, tipo, data_expedicao) VALUES
('HSP001','111.111.111-11','Cadastro de Pessoa Física','2005-01-01'),
('HSP001','11.111.111-1','Registro Geral','2004-06-15'),
('HSP002','222.222.222-22','Cadastro de Pessoa Física','2008-03-10'),
('HSP002','22.222.222-2','Registro Geral','2007-11-20'),
('HSP003','333.333.333-33','Cadastro de Pessoa Física','2010-05-15'),
('HSP004','444.444.444-44','Cadastro de Pessoa Física','2006-09-30'),
('HSP004','44.444.444-4','Registro Geral','2005-12-01'),
('HSP005','555.555.555-55','Cadastro de Pessoa Física','2013-07-22');

-- Hospedagens
INSERT INTO hospedagens VALUES
('HOS001','HSP001','ACOM002','2024-12-01'),
('HOS002','HSP003','ACOM001','2024-12-03'),
('HOS003','HSP004','ACOM005','2024-12-05');