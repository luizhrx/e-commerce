<div align="center">

# 🎮 CoreX E-Commerce

**Plataforma de e-commerce full-stack para hardware e periféricos gamer.**

Loja completa com catálogo, carrinho, checkout com frete, autenticação JWT e um painel administrativo para gestão de produtos, categorias e pedidos.

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

[🚀 Ver Demo](https://e-commerce-corex3.vercel.app) · [📋 Funcionalidades](#-funcionalidades) · [⚙️ Como Rodar](#️-como-rodar-o-projeto)

</div>

---

## 📖 Sobre o Projeto

O **CoreX** é uma aplicação de e-commerce **full-stack** construída como um monorepo:

- **Backend** — uma API REST em **Spring Boot (Java 21)** com autenticação JWT, controle de acesso por papéis (ADMIN / CLIENTE), persistência em PostgreSQL e upload de imagens para a nuvem via Cloudinary.
- **Frontend** — uma SPA em **React 19 + TypeScript + Vite**, com design *dark mode* premium, totalmente responsiva (mobile-first) e estilizada com Tailwind CSS.

O sistema cobre todo o fluxo de compra: navegação no catálogo, carrinho persistente, checkout com busca de endereço por CEP, criação de pedidos e acompanhamento de status — além de um painel administrativo completo.

> 💡 O frontend possui um **modo demonstrativo** (mocks) que exibe dados simulados quando a API não está disponível, útil para visualizar a interface sem subir o backend.

---

## ✨ Funcionalidades

### 🛍️ Área do Cliente
- **Autenticação JWT** — cadastro e login com validação de senha e sessão persistente (revalidada a cada carregamento).
- **Catálogo** — listagem de produtos com **busca por nome, filtro por categoria e faixa de preço**, paginação e skeletons de carregamento.
- **Página de produto** — detalhes, estoque em tempo real e imagem em alta.
- **Carrinho persistente** — salvo no `localStorage`, com controle de quantidade respeitando o estoque.
- **Checkout inteligente** — endereços salvos, **preenchimento automático via CEP (ViaCEP)**, cálculo de frete (grátis acima de R$ 250) e criação do pedido.
- **Meus Pedidos** — histórico com status visual (Pendente, Pago, Enviado, Entregue, Cancelado).

### 🔐 Painel Administrativo (ADMIN)
- **Dashboard** — contagem de pedidos por status.
- **Gestão de Produtos** — CRUD completo com **upload de imagem (clique ou arrastar-e-soltar)** enviado ao Cloudinary, busca em tempo real e validação de arquivo.
- **Gestão de Categorias** — CRUD com proteção contra exclusão de categorias vinculadas.
- **Gestão de Pedidos** — listagem com **identificação do cliente** e alteração de status com regras de transição.

### 🛡️ Segurança & Qualidade
- Rotas protegidas por autenticação **e** por papel (guardas no front e no back).
- Tratamento de erros que **nunca vaza** stack traces, tokens ou dados sensíveis ao usuário.
- Validação client-side + server-side em todos os formulários.
- Sanitização de URLs de imagem (bloqueio de `javascript:` / `data:`).
- Interface **100% responsiva** — menu hambúrguer no mobile, filtros colapsáveis, alvos de toque confortáveis.

---

## 🧰 Tech Stack

| Camada | Tecnologias |
|---|---|
| **Backend** | Java 21 · Spring Boot 4.1 · Spring Web MVC · Spring Data JPA · Spring Security · Spring Validation |
| **Auth** | JWT (jjwt 0.12) · BCrypt |
| **Banco de Dados** | PostgreSQL (produção) · H2 (testes) |
| **Mídia** | Cloudinary (upload/armazenamento de imagens) |
| **Docs da API** | springdoc-openapi (Swagger UI) |
| **Frontend** | React 19 · TypeScript · Vite 8 · Tailwind CSS 4 |
| **Bibliotecas** | React Router 7 · Axios · Framer Motion · Sonner · Lucide React |
| **DevOps** | Docker · Docker Compose · Maven · Vercel |

---

## 📁 Estrutura do Repositório

```
e-commerce/
├── src/main/java/br/com/springjpa/ecommerce/   # 🔙 Backend (Spring Boot)
│   ├── controller/     # Endpoints REST
│   ├── service/        # Regras de negócio
│   ├── repository/     # Acesso a dados (JPA)
│   ├── model/          # Entidades
│   ├── dto/            # Objetos de request/response
│   ├── enums/          # StatusPedido, etc.
│   └── infra/config/   # Security, JWT, Cloudinary, Swagger
│
├── e-commerce-front/                            # 🎨 Frontend (React + Vite)
│   └── src/
│       ├── pages/          # Home, Login, Carrinho, Checkout, Admin...
│       ├── components/     # ProductCard, ProductFilters, Pagination...
│       ├── context/        # AuthContext, CartContext
│       ├── hooks/          # useProducts
│       ├── services/       # Comunicação com a API (axios)
│       └── utils/          # Segurança, validações, helpers
│
├── docker-compose.yaml     # Sobe API + PostgreSQL
├── Dockerfile              # Build da imagem do backend
└── pom.xml                # Dependências Maven
```

---

## ⚙️ Como Rodar o Projeto

### Pré-requisitos
- **Java 21+** e **Maven** (ou use o `mvnw` incluso)
- **Node.js 18+**
- **PostgreSQL** (ou Docker) e uma conta gratuita no **[Cloudinary](https://cloudinary.com/)**

---

### 🔙 Backend (Spring Boot)

```bash
# Na raiz do projeto — configure as variáveis de ambiente (ver seção abaixo)
./mvnw spring-boot:run
```

A API sobe em **`http://localhost:8080`**.

### 🎨 Frontend (React)

```bash
cd e-commerce-front
npm install
npm run dev
```

O app sobe em **`http://localhost:5173`**.

---

### 🐳 Alternativa: Docker Compose (API + Banco de uma vez)

Crie um arquivo `.env` na raiz e rode:

```bash
docker compose up --build
```

Isso levanta o **PostgreSQL** e a **API** já conectados (com healthcheck aguardando o banco ficar pronto).

---

## 🔑 Variáveis de Ambiente

### Backend — execução local (`./mvnw spring-boot:run`)

| Variável | Descrição |
|---|---|
| `DB_URL` | URL JDBC do PostgreSQL (ex: `jdbc:postgresql://localhost:5432/corex_db`) |
| `DATABASE_USERNAME` | Usuário do banco |
| `DATABASE_PASSWORD` | Senha do banco |
| `JWT_SECRET` | Chave secreta para assinar os tokens JWT |
| `EXPIRATION` | Tempo de expiração do token em ms (ex: `86400000`) |
| `CLOUD_NAME` | Cloud name do Cloudinary |
| `API_KEY` | API key do Cloudinary |
| `API_SECRET` | API secret do Cloudinary |

### Backend — via Docker Compose (`.env` na raiz)

| Variável | Descrição |
|---|---|
| `DB_URL` · `DB_USER` · `DB_PASS` | Conexão com o banco |
| `JWT_SECRET` | Chave secreta do JWT |
| `CLOUDINARY_CLOUD_NAME` · `CLOUDINARY_API_KEY` · `CLOUDINARY_API_SECRET` | Credenciais do Cloudinary |

### Frontend (`e-commerce-front/.env`)

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API (ex: `http://localhost:8080`) |
| `VITE_ENABLE_MOCKS` | `true` para exibir dados simulados quando a API estiver offline |

> ⚠️ **Nunca** commite arquivos `.env` com segredos reais — eles já estão no `.gitignore`.

---

## 🌐 Visão Geral da API

Documentação interativa completa via **Swagger UI**: `http://localhost:8080/swagger-ui.html`

| Grupo | Endpoints principais | Acesso |
|---|---|---|
| **Auth** | `POST /auth/registro` · `POST /auth/login` · `GET /auth/me` | Público / Autenticado |
| **Produtos** | `GET /produtos/disponiveis` · `GET /produtos/{id}` · `POST/PUT/DELETE /produtos` | Leitura pública / Escrita ADMIN |
| **Categorias** | `GET /categorias` · `POST/PUT/DELETE /categorias` | Leitura pública / Escrita ADMIN |
| **Pedidos** | `GET /pedidos` · `PATCH /pedidos/{id}/status` · `GET /pedidos/dashboard` | ADMIN |
| **Pedidos (cliente)** | `POST /usuarios/{id}/pedidos` · `GET /usuarios/{id}/pedidos` | Autenticado (dono) |
| **Endereços** | `GET/POST/PUT/DELETE /usuarios/{id}/enderecos` | Autenticado (dono) |

---

## 👤 Autor

**Luiz Henrique dos Santos Lopes**

[![GitHub](https://img.shields.io/badge/GitHub-luizhrx-181717?style=for-the-badge&logo=github)](https://github.com/luizhrx)

---

<div align="center">

⭐ Se este projeto te ajudou ou te interessou, deixe uma estrela no repositório!

</div>
