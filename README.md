# 🗂️ Scrum Manager - Gerenciador de Projetos Ágeis

Sistema completo de gerenciamento de projetos utilizando metodologia Scrum, inspirado no [Taiga.io](https://taiga.io/).

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)
![Zustand](https://img.shields.io/badge/Zustand-4.5-orange)

## 📋 Funcionalidades

### 🏃 Módulo Scrum
- **Backlog** - Gerenciamento de User Stories com pontuação por categorias (UX, Design, Front, Back)
- **Sprints** - Criação e gerenciamento de sprints com datas e métricas
- **Taskboard** - Quadro Kanban com drag-and-drop para gerenciamento de tarefas
- **Tarefas** - Criação de tarefas vinculadas ou independentes de User Stories

### 🐛 Módulo de Issues
- Rastreamento de bugs, melhorias, perguntas e suporte
- Classificação por tipo, severidade e prioridade
- Sistema de status configurável

### 📚 Módulo Wiki
- Documentação do projeto em Markdown
- Sistema de bookmarks/marcadores
- Histórico de edições e versionamento
- Suporte a anexos

### 👥 Gestão de Equipe
- Convite de membros
- Papéis e permissões
- Histórico de atividades

### ⚙️ Configurações
- Personalização de módulos
- Categorias de pontos
- Status customizáveis
- Exportação/Importação de dados

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone <seu-repositorio>
cd taiga-scrum-clone

# Instale as dependências
npm install

# Execute em desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

### Build para Produção

```bash
npm run build
npm start
```

## 🏗️ Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── page.tsx           # Página inicial (lista de projetos)
│   └── projeto/
│       └── [id]/          # Rotas dinâmicas do projeto
│           ├── backlog/
│           ├── sprint/[sprintId]/
│           ├── issues/
│           ├── wiki/
│           ├── equipe/
│           └── configuracoes/
├── components/
│   ├── layout/            # Sidebar, Header
│   ├── ui/                # Componentes reutilizáveis (Button, Modal, etc)
│   ├── scrum/             # Backlog, SprintTaskboard
│   ├── issues/            # Lista de Issues
│   └── wiki/              # Componentes Wiki
├── lib/
│   ├── store.ts           # Store Zustand (estado global)
│   └── utils.ts           # Utilitários
└── types/
    └── index.ts           # Definições TypeScript
```

## 🛠️ Tecnologias Utilizadas

- **[Next.js 14](https://nextjs.org/)** - Framework React com App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[TailwindCSS](https://tailwindcss.com/)** - Estilização utilitária
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Gerenciamento de estado
- **[@dnd-kit](https://dndkit.com/)** - Drag and Drop
- **[Lucide React](https://lucide.dev/)** - Ícones
- **[React Markdown](https://github.com/remarkjs/react-markdown)** - Renderização Markdown

## 📱 Screenshots

### Dashboard de Projetos
Lista de todos os projetos com métricas resumidas.

### Backlog
Gerenciamento de User Stories com pontuação e status.

### Sprint Taskboard
Quadro Kanban para gerenciamento visual de tarefas.

### Wiki
Documentação colaborativa com suporte a Markdown.

## 🎨 Personalização

### Cores
As cores podem ser personalizadas em `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#00afaf', // Cor principal
  },
  sidebar: {
    DEFAULT: '#2c3e50', // Cor do menu lateral
  },
}
```

### Fontes
O projeto usa Open Sans e Poppins por padrão. Modifique em `globals.css`.

## 🔧 Configuração para Windsurf

Para usar este projeto no Windsurf:

1. Abra o projeto no Windsurf
2. Execute `npm install` no terminal integrado
3. Execute `npm run dev`
4. O Windsurf detectará automaticamente o projeto Next.js

## 📝 Próximos Passos

- [ ] Persistência com banco de dados (Supabase)
- [ ] Autenticação de usuários
- [ ] Notificações em tempo real
- [ ] Burndown charts
- [ ] Integração com Git
- [ ] Modo offline (PWA)
- [ ] Temas claro/escuro

## 📄 Licença

Este projeto é para fins educacionais e de demonstração.

---

Desenvolvido com ❤️ para a comunidade de desenvolvimento ágil.
