// ==========================================
// TIPOS DO SISTEMA SCRUM - TAIGA CLONE
// ==========================================

// ==========================================
// PROJETO
// ==========================================
export interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  slug: string;
  dataCriacao: Date;
  dataModificacao: Date;
  proprietario: Usuario;
  membros: Membro[];
  isPrivado: boolean;
  isArquivado: boolean;
  
  // Configurações de módulos
  scrumAtivo: boolean;
  issuesAtivo: boolean;
  wikiAtivo: boolean;
  
  // Configurações de pontos
  categoriaPontos: CategoriaPonto[];
  
  // Permissões
  permissoesPublicas: string[];
  permissoesAnonimas: string[];
  
  // Estatísticas
  totalPontos: number;
  pontosDefinidos: number;
  pontosFechados: number;
}

export interface CategoriaPonto {
  id: string;
  nome: string; // UX, Design, Front, Back
  ordem: number;
}

// ==========================================
// USUÁRIO E MEMBROS
// ==========================================
export interface Usuario {
  id: string;
  nome: string;
  nomeCompleto: string;
  email: string;
  avatar?: string;
  bio?: string;
  dataCadastro: Date;
}

export interface Membro {
  id: string;
  usuario: Usuario;
  projeto: string; // ID do projeto
  papel: Papel;
  isAdmin: boolean;
  dataEntrada: Date;
}

export interface Papel {
  id: string;
  nome: string;
  slug: string;
  permissoes: string[];
  ordem: number;
  projeto: string;
}

// ==========================================
// USER STORY
// ==========================================
export interface UserStory {
  id: string;
  ref: number; // #1, #2, etc.
  titulo: string;
  descricao: string;
  projeto: string;
  
  // Status
  status: StatusUserStory;
  
  // Pontos por categoria
  pontos: PontoUserStory[];
  totalPontos: number;
  
  // Relacionamentos
  sprint?: string; // ID do Sprint
  tarefas: string[]; // IDs das tarefas
  
  // Metadados
  tags: Tag[];
  anexos: Anexo[];
  atribuidos: string[]; // IDs dos usuários
  observadores: string[]; // IDs dos usuários
  
  // Auditoria
  criadoPor: string;
  dataCriacao: Date;
  dataModificacao: Date;
  
  // Posição
  ordem: number;
  ordemKanban: number;
}

export interface PontoUserStory {
  categoria: string; // ID da categoria
  valor: number | null; // null = "?"
}

export type StatusUserStory = 
  | 'novo'
  | 'emProgresso'
  | 'prontoParaTeste'
  | 'fechado'
  | 'precisaInfo';

export const STATUS_USER_STORY_CONFIG: Record<StatusUserStory, { label: string; cor: string }> = {
  novo: { label: 'Novo', cor: '#70728f' },
  emProgresso: { label: 'Em Progresso', cor: '#e44057' },
  prontoParaTeste: { label: 'Pronto para Teste', cor: '#ffc107' },
  fechado: { label: 'Fechado', cor: '#a8e6cf' },
  precisaInfo: { label: 'Precisa de Informação', cor: '#ff9800' },
};

// ==========================================
// TAREFA (TASK)
// ==========================================
export interface Tarefa {
  id: string;
  ref: number;
  titulo: string;
  descricao: string;
  projeto: string;
  
  // Relacionamento
  userStory?: string; // ID da User Story (null = storyless)
  sprint?: string;
  
  // Status
  status: StatusTarefa;
  
  // Metadados
  tags: Tag[];
  anexos: Anexo[];
  atribuido?: string; // ID do usuário
  observadores: string[];
  
  // Auditoria
  criadoPor: string;
  dataCriacao: Date;
  dataModificacao: Date;
  
  // Posição
  ordem: number;
}

export type StatusTarefa = 
  | 'novo'
  | 'emProgresso'
  | 'prontoParaTeste'
  | 'fechado'
  | 'precisaInfo';

export const STATUS_TAREFA_CONFIG: Record<StatusTarefa, { label: string; cor: string }> = {
  novo: { label: 'Novo', cor: '#70728f' },
  emProgresso: { label: 'Em Progresso', cor: '#e44057' },
  prontoParaTeste: { label: 'Pronto para Teste', cor: '#ffc107' },
  fechado: { label: 'Fechado', cor: '#a8e6cf' },
  precisaInfo: { label: 'Precisa de Informação', cor: '#ff9800' },
};

// ==========================================
// SPRINT (MILESTONE)
// ==========================================
export interface Sprint {
  id: string;
  nome: string;
  projeto: string;
  
  // Datas
  dataInicio: Date;
  dataFim: Date;
  
  // User Stories
  userStories: string[]; // IDs
  
  // Estatísticas
  totalPontos: number;
  pontosCompletados: number;
  tarefasAbertas: number;
  tarefasFechadas: number;
  
  // Status
  isFechado: boolean;
  
  // Auditoria
  dataCriacao: Date;
  dataModificacao: Date;
  
  // Posição
  ordem: number;
}

// ==========================================
// ISSUE (PROBLEMA/BUG)
// ==========================================
export interface Issue {
  id: string;
  ref: number;
  titulo: string;
  descricao: string;
  projeto: string;
  
  // Classificação
  tipo: TipoIssue;
  severidade: Severidade;
  prioridade: Prioridade;
  status: StatusIssue;
  
  // Metadados
  tags: Tag[];
  anexos: Anexo[];
  comentarios: Comentario[];
  atribuido?: string;
  observadores: string[];
  
  // Auditoria
  criadoPor: string;
  dataCriacao: Date;
  dataModificacao: Date;
  
  // Posição
  ordem: number;
}

export type TipoIssue = 'bug' | 'melhoria' | 'pergunta' | 'suporte';

export const TIPO_ISSUE_CONFIG: Record<TipoIssue, { label: string; cor: string }> = {
  bug: { label: 'Bug', cor: '#f44336' },
  melhoria: { label: 'Melhoria', cor: '#2196f3' },
  pergunta: { label: 'Pergunta', cor: '#9c27b0' },
  suporte: { label: 'Suporte', cor: '#607d8b' },
};

export type Severidade = 'wishlist' | 'minor' | 'normal' | 'important' | 'critical';

export const SEVERIDADE_CONFIG: Record<Severidade, { label: string; cor: string }> = {
  wishlist: { label: 'Desejável', cor: '#9e9e9e' },
  minor: { label: 'Menor', cor: '#4caf50' },
  normal: { label: 'Normal', cor: '#4caf50' },
  important: { label: 'Importante', cor: '#ffc107' },
  critical: { label: 'Crítico', cor: '#f44336' },
};

export type Prioridade = 'baixa' | 'normal' | 'alta';

export const PRIORIDADE_CONFIG: Record<Prioridade, { label: string; cor: string }> = {
  baixa: { label: 'Baixa', cor: '#4caf50' },
  normal: { label: 'Normal', cor: '#ffc107' },
  alta: { label: 'Alta', cor: '#f44336' },
};

export type StatusIssue = 
  | 'novo'
  | 'emProgresso'
  | 'prontoParaTeste'
  | 'fechado'
  | 'precisaInfo'
  | 'rejeitado';

export const STATUS_ISSUE_CONFIG: Record<StatusIssue, { label: string; cor: string }> = {
  novo: { label: 'Novo', cor: '#70728f' },
  emProgresso: { label: 'Em Progresso', cor: '#e44057' },
  prontoParaTeste: { label: 'Pronto para Teste', cor: '#ffc107' },
  fechado: { label: 'Fechado', cor: '#a8e6cf' },
  precisaInfo: { label: 'Precisa de Informação', cor: '#ff9800' },
  rejeitado: { label: 'Rejeitado', cor: '#9e9e9e' },
};

// ==========================================
// WIKI
// ==========================================
export interface WikiPage {
  id: string;
  slug: string;
  titulo: string;
  conteudo: string; // Markdown
  projeto: string;
  
  // Metadados
  proprietario: string;
  ultimoModificador: string;
  
  // Auditoria
  dataCriacao: Date;
  dataModificacao: Date;
  edicoes: number;
  versao: number;
  
  // Observadores
  observadores: string[];
  totalObservadores: number;
  
  // Anexos
  anexos: Anexo[];
}

export interface WikiLink {
  id: string;
  titulo: string;
  href: string; // Slug da página
  projeto: string;
  ordem: number;
}

// ==========================================
// COMPONENTES COMPARTILHADOS
// ==========================================
export interface Tag {
  id: string;
  nome: string;
  cor: string;
}

export interface Anexo {
  id: string;
  nome: string;
  url: string;
  tamanho: number; // bytes
  tipo: string; // MIME type
  descricao?: string;
  isDeprecado: boolean;
  
  // Auditoria
  enviadoPor: string;
  dataEnvio: Date;
}

export interface Comentario {
  id: string;
  conteudo: string;
  autor: string;
  dataCriacao: Date;
  dataModificacao?: Date;
  isEditado: boolean;
}


// ==========================================
// FILTROS E BUSCA
// ==========================================
export interface FiltroBacklog {
  texto?: string;
  tags?: string[];
  status?: StatusUserStory[];
  atribuidos?: string[];
  sprints?: string[];
}

export interface FiltroIssue {
  texto?: string;
  tipos?: TipoIssue[];
  severidades?: Severidade[];
  prioridades?: Prioridade[];
  status?: StatusIssue[];
  atribuidos?: string[];
  tags?: string[];
}

// ==========================================
// PERMISSÕES
// ==========================================
export const PERMISSOES = {
  // Projeto
  VIEW_PROJECT: 'view_project',
  MODIFY_PROJECT: 'modify_project',
  DELETE_PROJECT: 'delete_project',
  
  // User Stories
  VIEW_US: 'view_us',
  ADD_US: 'add_us',
  MODIFY_US: 'modify_us',
  DELETE_US: 'delete_us',
  
  // Tarefas
  VIEW_TASK: 'view_task',
  ADD_TASK: 'add_task',
  MODIFY_TASK: 'modify_task',
  DELETE_TASK: 'delete_task',
  
  // Issues
  VIEW_ISSUE: 'view_issue',
  ADD_ISSUE: 'add_issue',
  MODIFY_ISSUE: 'modify_issue',
  DELETE_ISSUE: 'delete_issue',
  
  // Wiki
  VIEW_WIKI_PAGE: 'view_wiki_page',
  ADD_WIKI_PAGE: 'add_wiki_page',
  MODIFY_WIKI_PAGE: 'modify_wiki_page',
  DELETE_WIKI_PAGE: 'delete_wiki_page',
  ADD_WIKI_LINK: 'add_wiki_link',
  DELETE_WIKI_LINK: 'delete_wiki_link',
  
  // Sprint
  VIEW_MILESTONE: 'view_milestone',
  ADD_MILESTONE: 'add_milestone',
  MODIFY_MILESTONE: 'modify_milestone',
  DELETE_MILESTONE: 'delete_milestone',
} as const;

export type Permissao = typeof PERMISSOES[keyof typeof PERMISSOES];

// ==========================================
// ATIVIDADE (TIMELINE)
// ==========================================
export type TipoAtividade = 
  | 'criar_user_story'
  | 'atualizar_user_story'
  | 'mover_user_story'
  | 'criar_tarefa'
  | 'atualizar_tarefa'
  | 'atualizar_status_tarefa'
  | 'criar_issue'
  | 'atualizar_issue'
  | 'criar_sprint'
  | 'atualizar_sprint'
  | 'criar_wiki'
  | 'atualizar_wiki'
  | 'adicionar_comentario'
  | 'adicionar_anexo';

export interface Atividade {
  id: string;
  tipo: TipoAtividade;
  projeto: string;
  usuario: string;
  usuarioNome: string;
  
  // Referências
  entidadeId?: string;
  entidadeTipo?: 'user_story' | 'tarefa' | 'issue' | 'sprint' | 'wiki';
  entidadeRef?: number;
  entidadeTitulo?: string;
  
  // Detalhes da ação
  descricao: string;
  detalhes?: {
    campo?: string;
    valorAntigo?: string;
    valorNovo?: string;
    sprintNome?: string;
    projetoNome?: string;
  };
  
  // Auditoria
  dataCriacao: Date;
}
