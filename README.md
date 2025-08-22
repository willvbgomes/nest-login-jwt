[Node Badge]: https://img.shields.io/badge/Node.js-5fa04e?style=for-the-badge&logo=nodedotjs&labelColor=000
[NestJS Badge]: https://img.shields.io/badge/NestJS-e0234e?style=for-the-badge&logo=nestjs&labelColor=000&logoColor=e0234e
[Typescript Badge]: https://img.shields.io/badge/TypeScript-3178c6?style=for-the-badge&logo=typescript&labelColor=000
[Prisma Badge]: https://img.shields.io/badge/Prisma-2d3748?style=for-the-badge&logo=prisma&labelColor=000
[Jest Badge]: https://img.shields.io/badge/Jest-c21325?style=for-the-badge&logo=jest&labelColor=000&logoColor=c21325
[JWT Badge]: https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&labelColor=000
[Docker Badge]: https://img.shields.io/badge/Docker-2496ed?style=for-the-badge&logo=docker&labelColor=000

<h1 align="center" style="font-weight: bold;">API de Autenticação com JWT</h1>

<div align="center">

![node][Node Badge]
![nestjs][NestJS Badge]
![typescript][Typescript Badge]
![prisma][Prisma Badge]
![jest][Jest Badge]
![jwt][JWT Badge]
![docker][Docker Badge]

</div>

## Conteúdo

- [Sobre](#pushpin-sobre)
- [Tecnologias Utilizadas](#computer-tecnologias-utilizadas)
- [Instalação](#arrow_down-instalação)
- [Testes](#test_tube-testes)
- [Endpoints da API](#dart-endpoints-da-api)

## :pushpin: Sobre

Esta é uma API de autenticação de usuários utilizando JSON Web Tokens (JWT). A API fornece endpoints para login, logout, visualização de perfil e atualização de tokens. A estratégia de autenticação utiliza Access e Refresh Tokens, com o Refresh Token sendo armazenado em um cookie HttpOnly seguro.

## :computer: Tecnologias Utilizadas

- **Node.js**
- **NestJS**
- **TypeScript**
- **Prisma**
- **JWT**
- **Jest**
- **BcryptJS**
- **Cookie-Parser**
- **Class-Validator**
- **Docker**

## :arrow_down: Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/en/download/current)
- [Git](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/get-started) (Opcional)

### 1. Clone o repositório

```bash
git clone https://github.com/willvbgomes/nest-login-jwt.git
cd nest-login-jwt
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis de ambiente:

```env
PORT=
CLIENT_URL=
DATABASE_URL=
JWT_SECRET=
CLIENT_URL=
```

### 4. Rodando a API

#### 4.1 Utilizando o Docker

Para rodar a API em um ambiente de containers Docker:

```bash
docker compose up -d
```

#### 4.2 Sem utilizar o Docker

Aplique as migrations do banco de dados conforme o arquivo `schema.prisma`:

```bash
npm run migrate:dev
```

Para rodar a API em modo de desenvolvimento com recarregamento automático:

```bash
npm run start:dev
```

> Após rodar as migrations (ou rodar a API via docker), será criado automaticamente um usuário para testes manuais nas rotas.

```bash
# dados do usuário para testes manuais

{
  "email": "test@test.com",
  "password": "123123"
}
```

## :test_tube: Testes

Este projeto inclui testes unitários e para garantir a qualidade e o correto funcionamento da API.

### Rodando os testes

Para rodar os testes unitários:

```bash
npm run test
```

Para rodar os testes unitários em modo de observação (watch mode):

```bash
npm run test:watch
```

Para gerar o relatório de cobertura de testes:

```bash
npm run test:cov
```

## :dart: Endpoints da API

| Rota                              | Descrição                                              |  Autenticação   |
| --------------------------------- | ------------------------------------------------------ | :-------------: |
| <kbd>POST</kbd> /api/auth/login   | Realiza o login do usuário e retorna um `accessToken`. |       Não       |
| <kbd>POST</kbd> /api/auth/logout  | Realiza o logout do usuário.                           |       Não       |
| <kbd>GET</kbd> /api/auth/profile  | Retorna o perfil do usuário autenticado.               | `Access Token`  |
| <kbd>POST</kbd> /api/auth/refresh | Atualiza os `access` e `refresh` tokens.               | `Refresh Token` |

---

### Exemplos

<kbd>**POST /api/auth/login**</kbd>

**Corpo da Requisição:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Resposta (200 OK):**

> Define um cookie `refresh_token` do tipo HttpOnly.

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Resposta (404 Not Found):**

```json
{
  "message": "User not found",
  "error": "Not Found",
  "statusCode": 404
}
```

**Resposta (401 Unauthorized):**

```json
{
  "message": "Invalid credentials",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

<kbd>**POST /api/auth/logout**</kbd>

**Resposta (204 No Content):**

> Limpa o cookie `refresh_token`.

---

<kbd>**GET /api/auth/profile**</kbd>

**Cabeçalho da Requisição:**

```
Authorization: Bearer <accessToken>
```

**Resposta (200 OK):**

```json
{
  "sub": "c1b2a3d4-e5f6-7890-1234-567890abcdef",
  "email": "user@example.com"
}
```

**Resposta (401 Unauthorized):**

```json
{
  "message": "Token not found",
  "error": "Unauthorized",
  "statusCode": 401
}
```

**Resposta (401 Unauthorized):**

```json
{
  "message": "Invalid Token",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

<kbd>**POST /api/auth/refresh**</kbd>

**Cabeçalho da Requisição:**

> A requisição deve conter o cookie `refresh_token` enviado pelo servidor no momento do login.

**Resposta (201 Created):**

> Define um **novo** cookie `refresh_token` do tipo HttpOnly.

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Resposta (401 Unauthorized):**

```json
{
  "message": "Token not found",
  "error": "Unauthorized",
  "statusCode": 401
}
```

**Resposta (401 Unauthorized):**

```json
{
  "message": "Invalid Token",
  "error": "Unauthorized",
  "statusCode": 401
}
```
