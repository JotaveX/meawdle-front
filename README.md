# 🐱 Meawdle Front

> Interface web da plataforma Meawdle — navegue por um catálogo de gatos disponíveis para adoção, com fotos, informações e links diretos para adotar.

## 🚀 Stack

| Tecnologia | Uso |
|---|---|
| **Angular 18** | Framework frontend (standalone components) |
| **TypeScript** | Tipagem estática |
| **CSS** | Estilização customizada |
| **Angular CLI** | Tooling de build e dev server |

## 📦 Estrutura do projeto

```
meawdle-front/
├── public/                  # Assets estáticos
├── src/
│   └── app/
│       ├── components/      # Componentes da UI (cards, listagem, etc.)
│       ├── config/          # Configurações (URLs da API, constantes)
│       ├── models/          # Interfaces e tipos TypeScript
│       ├── services/        # Services para comunicação com a API
│       ├── app.component.*  # Componente raiz
│       ├── app.config.ts    # Configuração standalone do Angular
│       └── app.routes.ts    # Rotas da aplicação
├── angular.json
├── tsconfig.json
└── package.json
```

## ⚡ Como rodar

### Pré-requisitos

- Node.js >= 18
- Angular CLI >= 18 (`npm install -g @angular/cli`)
- [meawdle-api](https://github.com/jotaveX/meawdle-api) rodando localmente

### Instalação

```bash
# Clone o repositório
git clone https://github.com/jotaveX/meawdle-front.git
cd meawdle-front

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
ng serve
```

Acesse `http://localhost:4200`. A aplicação recarrega automaticamente a cada alteração nos arquivos fonte.

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `ng serve` | Dev server com hot reload |
| `ng build` | Build de produção (output em `dist/`) |
| `ng test` | Testes unitários via Karma |
| `ng e2e` | Testes end-to-end |

## 🖥️ Funcionalidades

- Listagem de gatos disponíveis para adoção
- Visualização de detalhes de cada gato (foto, nome, informações)
- Link direto para página de adoção
- Interface responsiva

## 🔗 Projeto relacionado

- **Backend:** [meawdle-api](https://github.com/jotaveX/meawdle-api) — API NestJS + Prisma + PostgreSQL que alimenta esta interface

## 📸 Screenshots

> _Em breve — adicione screenshots da aplicação rodando aqui._

<!-- Descomente e substitua quando tiver as imagens:
![Home](./screenshots/home.png)
![Detalhes](./screenshots/details.png)
-->

## 📄 Licença

Este projeto é open source.

---

Feito por [João Victor Piloni](https://github.com/jotaveX)
