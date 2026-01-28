import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  Projeto,
  UserStory,
  Tarefa,
  Sprint,
  Issue,
  WikiPage,
  WikiLink,
  Usuario,
  Tag,
  StatusUserStory,
  StatusTarefa,
  StatusIssue,
  TipoIssue,
  Severidade,
  Prioridade,
  Atividade,
  TipoAtividade,
} from '@/types';

// ==========================================
// DADOS INICIAIS DE EXEMPLO
// ==========================================
const usuarioDemo: Usuario = {
  id: 'user-1',
  nome: 'demo',
  nomeCompleto: 'Usuário Demo',
  email: 'demo@exemplo.com',
  dataCadastro: new Date(),
};

const projetoDemo: Projeto = {
  id: 'proj-1',
  nome: 'Conhecendo a Ferramenta',
  descricao: 'Projeto de demonstração do sistema Scrum',
  slug: 'conhecendo-a-ferramenta',
  dataCriacao: new Date(),
  dataModificacao: new Date(),
  proprietario: usuarioDemo,
  membros: [],
  isPrivado: false,
  isArquivado: false,
  scrumAtivo: true,
  issuesAtivo: true,
  wikiAtivo: true,
  categoriaPontos: [
    { id: 'cat-1', nome: 'UX', ordem: 1 },
    { id: 'cat-2', nome: 'Design', ordem: 2 },
    { id: 'cat-3', nome: 'Front', ordem: 3 },
    { id: 'cat-4', nome: 'Back', ordem: 4 },
  ],
  permissoesPublicas: [],
  permissoesAnonimas: [],
  totalPontos: 40,
  pontosDefinidos: 40,
  pontosFechados: 0,
};

// ==========================================
// INTERFACE DO STORE
// ==========================================
interface AppState {
  // Usuário atual
  usuarioAtual: Usuario | null;
  setUsuarioAtual: (usuario: Usuario | null) => void;
  
  // Projetos
  projetos: Projeto[];
  projetoAtual: string | null;
  adicionarProjeto: (projeto: Omit<Projeto, 'id' | 'dataCriacao' | 'dataModificacao'>) => string;
  atualizarProjeto: (id: string, dados: Partial<Projeto>) => void;
  excluirProjeto: (id: string) => void;
  setProjetoAtual: (id: string | null) => void;
  getProjetoAtual: () => Projeto | undefined;
  
  // User Stories
  userStories: UserStory[];
  adicionarUserStory: (userStory: Omit<UserStory, 'id' | 'ref' | 'dataCriacao' | 'dataModificacao'>) => string;
  atualizarUserStory: (id: string, dados: Partial<UserStory>) => void;
  excluirUserStory: (id: string) => void;
  getUserStoriesPorProjeto: (projetoId: string) => UserStory[];
  getUserStoriesPorSprint: (sprintId: string) => UserStory[];
  getUserStoryById: (id: string) => UserStory | undefined;
  getBacklog: (projetoId: string) => UserStory[];
  
  // Tarefas
  tarefas: Tarefa[];
  adicionarTarefa: (tarefa: Omit<Tarefa, 'id' | 'ref' | 'dataCriacao' | 'dataModificacao'>) => string;
  atualizarTarefa: (id: string, dados: Partial<Tarefa>) => void;
  excluirTarefa: (id: string) => void;
  getTarefasPorUserStory: (userStoryId: string) => Tarefa[];
  getTarefasPorSprint: (sprintId: string) => Tarefa[];
  getTarefasSemHistoria: (sprintId: string) => Tarefa[];
  
  // Sprints
  sprints: Sprint[];
  adicionarSprint: (sprint: Omit<Sprint, 'id' | 'dataCriacao' | 'dataModificacao'>) => string;
  atualizarSprint: (id: string, dados: Partial<Sprint>) => void;
  excluirSprint: (id: string) => void;
  getSprintsPorProjeto: (projetoId: string) => Sprint[];
  
  // Issues
  issues: Issue[];
  adicionarIssue: (issue: Omit<Issue, 'id' | 'ref' | 'dataCriacao' | 'dataModificacao'>) => string;
  atualizarIssue: (id: string, dados: Partial<Issue>) => void;
  excluirIssue: (id: string) => void;
  getIssuesPorProjeto: (projetoId: string) => Issue[];
  
  // Wiki
  wikiPages: WikiPage[];
  wikiLinks: WikiLink[];
  adicionarWikiPage: (page: Omit<WikiPage, 'id' | 'dataCriacao' | 'dataModificacao' | 'edicoes' | 'versao'>) => string;
  atualizarWikiPage: (id: string, dados: Partial<WikiPage>) => void;
  excluirWikiPage: (id: string) => void;
  getWikiPagesPorProjeto: (projetoId: string) => WikiPage[];
  getWikiPagePorSlug: (projetoId: string, slug: string) => WikiPage | undefined;
  adicionarWikiLink: (link: Omit<WikiLink, 'id'>) => string;
  atualizarWikiLink: (id: string, dados: Partial<WikiLink>) => void;
  excluirWikiLink: (id: string) => void;
  getWikiLinksPorProjeto: (projetoId: string) => WikiLink[];
  
  // Tags
  tags: Tag[];
  adicionarTag: (tag: Omit<Tag, 'id'>) => string;
  
  // Atividades (Timeline)
  atividades: Atividade[];
  registrarAtividade: (atividade: Omit<Atividade, 'id' | 'dataCriacao'>) => void;
  getAtividadesPorProjeto: (projetoId: string) => Atividade[];
  
  // Contadores de referência
  contadorRef: Record<string, number>;
  proximoRef: (projetoId: string) => number;
}

// ==========================================
// CRIAÇÃO DO STORE
// ==========================================
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Usuário atual
      usuarioAtual: usuarioDemo,
      setUsuarioAtual: (usuario) => set({ usuarioAtual: usuario }),
      
      // Projetos
      projetos: [projetoDemo],
      projetoAtual: projetoDemo.id,
      
      adicionarProjeto: (projeto) => {
        const id = uuidv4();
        const novoProjeto: Projeto = {
          ...projeto,
          id,
          dataCriacao: new Date(),
          dataModificacao: new Date(),
        };
        set((state) => ({
          projetos: [...state.projetos, novoProjeto],
        }));
        return id;
      },
      
      atualizarProjeto: (id, dados) => {
        set((state) => ({
          projetos: state.projetos.map((p) =>
            p.id === id ? { ...p, ...dados, dataModificacao: new Date() } : p
          ),
        }));
      },
      
      excluirProjeto: (id) => {
        set((state) => ({
          projetos: state.projetos.filter((p) => p.id !== id),
          projetoAtual: state.projetoAtual === id ? null : state.projetoAtual,
        }));
      },
      
      setProjetoAtual: (id) => set({ projetoAtual: id }),
      
      getProjetoAtual: () => {
        const state = get();
        return state.projetos.find((p) => p.id === state.projetoAtual);
      },
      
      // User Stories
      userStories: [
        {
          id: 'us-1',
          ref: 1,
          titulo: 'Teste',
          descricao: 'teste',
          projeto: 'proj-1',
          status: 'novo' as StatusUserStory,
          pontos: [
            { categoria: 'cat-1', valor: null },
            { categoria: 'cat-2', valor: 40 },
            { categoria: 'cat-3', valor: null },
            { categoria: 'cat-4', valor: null },
          ],
          totalPontos: 40,
          sprint: 'sprint-1',
          tarefas: [],
          tags: [],
          anexos: [],
          atribuidos: ['user-1'],
          observadores: [],
          criadoPor: 'user-1',
          dataCriacao: new Date('2026-01-27T22:20:00'),
          dataModificacao: new Date('2026-01-27T22:20:00'),
          ordem: 1,
          ordemKanban: 1,
        },
      ],
      
      adicionarUserStory: (userStory) => {
        const id = uuidv4();
        const ref = get().proximoRef(userStory.projeto);
        const novaUserStory: UserStory = {
          ...userStory,
          id,
          ref,
          dataCriacao: new Date(),
          dataModificacao: new Date(),
        };
        set((state) => ({
          userStories: [...state.userStories, novaUserStory],
        }));
        
        // Registrar atividade
        const usuario = get().usuarioAtual;
        const sprint = userStory.sprint ? get().sprints.find(s => s.id === userStory.sprint) : null;
        get().registrarAtividade({
          tipo: 'criar_user_story',
          projeto: userStory.projeto,
          usuario: usuario?.id || '',
          usuarioNome: usuario?.nomeCompleto || 'Usuário',
          entidadeId: id,
          entidadeTipo: 'user_story',
          entidadeRef: ref,
          entidadeTitulo: userStory.titulo,
          descricao: sprint 
            ? `has added the user story <strong>#${ref} ${userStory.titulo}</strong> to <strong>${sprint.nome}</strong>`
            : `has created a new user story <strong>#${ref} ${userStory.titulo}</strong>`,
        });
        
        return id;
      },
      
      atualizarUserStory: (id, dados) => {
        set((state) => ({
          userStories: state.userStories.map((us) =>
            us.id === id ? { ...us, ...dados, dataModificacao: new Date() } : us
          ),
        }));
      },
      
      excluirUserStory: (id) => {
        set((state) => ({
          userStories: state.userStories.filter((us) => us.id !== id),
        }));
      },
      
      getUserStoriesPorProjeto: (projetoId) => {
        return get().userStories.filter((us) => us.projeto === projetoId);
      },
      
      getUserStoriesPorSprint: (sprintId) => {
        return get().userStories.filter((us) => us.sprint === sprintId);
      },

      getUserStoryById: (id) => {
        return get().userStories.find((us) => us.id === id);
      },
      
      getBacklog: (projetoId) => {
        return get().userStories.filter(
          (us) => us.projeto === projetoId && !us.sprint
        );
      },
      
      // Tarefas
      tarefas: [],
      
      adicionarTarefa: (tarefa) => {
        const id = uuidv4();
        const ref = get().proximoRef(tarefa.projeto);
        const novaTarefa: Tarefa = {
          ...tarefa,
          id,
          ref,
          dataCriacao: new Date(),
          dataModificacao: new Date(),
        };
        set((state) => ({
          tarefas: [...state.tarefas, novaTarefa],
        }));
        
        // Registrar atividade
        const usuario = get().usuarioAtual;
        const userStory = tarefa.userStory ? get().userStories.find(us => us.id === tarefa.userStory) : null;
        get().registrarAtividade({
          tipo: 'criar_tarefa',
          projeto: tarefa.projeto,
          usuario: usuario?.id || '',
          usuarioNome: usuario?.nomeCompleto || 'Usuário',
          entidadeId: id,
          entidadeTipo: 'tarefa',
          entidadeRef: ref,
          entidadeTitulo: tarefa.titulo,
          descricao: userStory 
            ? `has created the task <strong>#${ref} ${tarefa.titulo}</strong> for user story <strong>#${userStory.ref} ${userStory.titulo}</strong>`
            : `has created a new task <strong>#${ref} ${tarefa.titulo}</strong>`,
        });
        
        return id;
      },
      
      atualizarTarefa: (id, dados) => {
        const tarefaAnterior = get().tarefas.find(t => t.id === id);
        set((state) => ({
          tarefas: state.tarefas.map((t) =>
            t.id === id ? { ...t, ...dados, dataModificacao: new Date() } : t
          ),
        }));
        
        // Registrar atividade de mudança de status
        if (dados.status && tarefaAnterior && dados.status !== tarefaAnterior.status) {
          const usuario = get().usuarioAtual;
          const userStory = tarefaAnterior.userStory ? get().userStories.find(us => us.id === tarefaAnterior.userStory) : null;
          get().registrarAtividade({
            tipo: 'atualizar_status_tarefa',
            projeto: tarefaAnterior.projeto,
            usuario: usuario?.id || '',
            usuarioNome: usuario?.nomeCompleto || 'Usuário',
            entidadeId: id,
            entidadeTipo: 'tarefa',
            entidadeRef: tarefaAnterior.ref,
            entidadeTitulo: tarefaAnterior.titulo,
            descricao: userStory
              ? `has updated the attribute "Status" of the task <strong>#${tarefaAnterior.ref} ${tarefaAnterior.titulo}</strong> which belongs to the user story <strong>#${userStory.ref} ${userStory.titulo}</strong> to <strong>${dados.status}</strong>`
              : `has updated the status of task <strong>#${tarefaAnterior.ref} ${tarefaAnterior.titulo}</strong> to <strong>${dados.status}</strong>`,
            detalhes: {
              campo: 'Status',
              valorAntigo: tarefaAnterior.status,
              valorNovo: dados.status,
            },
          });
        }
      },
      
      excluirTarefa: (id) => {
        set((state) => ({
          tarefas: state.tarefas.filter((t) => t.id !== id),
        }));
      },
      
      getTarefasPorUserStory: (userStoryId) => {
        return get().tarefas.filter((t) => t.userStory === userStoryId);
      },
      
      getTarefasPorSprint: (sprintId) => {
        return get().tarefas.filter((t) => t.sprint === sprintId);
      },
      
      getTarefasSemHistoria: (sprintId) => {
        return get().tarefas.filter(
          (t) => t.sprint === sprintId && !t.userStory
        );
      },
      
      // Sprints
      sprints: [
        {
          id: 'sprint-1',
          nome: 'teste',
          projeto: 'proj-1',
          dataInicio: new Date('2026-01-28'),
          dataFim: new Date('2026-02-11'),
          userStories: ['us-1'],
          totalPontos: 40,
          pontosCompletados: 0,
          tarefasAbertas: 0,
          tarefasFechadas: 0,
          isFechado: false,
          dataCriacao: new Date('2026-01-28'),
          dataModificacao: new Date('2026-01-28'),
          ordem: 1,
        },
      ],
      
      adicionarSprint: (sprint) => {
        const id = uuidv4();
        const novoSprint: Sprint = {
          ...sprint,
          id,
          dataCriacao: new Date(),
          dataModificacao: new Date(),
        };
        set((state) => ({
          sprints: [...state.sprints, novoSprint],
        }));
        
        // Registrar atividade
        const usuario = get().usuarioAtual;
        const projeto = get().projetos.find(p => p.id === sprint.projeto);
        get().registrarAtividade({
          tipo: 'criar_sprint',
          projeto: sprint.projeto,
          usuario: usuario?.id || '',
          usuarioNome: usuario?.nomeCompleto || 'Usuário',
          entidadeId: id,
          entidadeTipo: 'sprint',
          entidadeTitulo: sprint.nome,
          descricao: `has created a new sprint <strong>${sprint.nome}</strong> in <strong>${projeto?.nome || 'Projeto'}</strong>`,
        });
        
        return id;
      },
      
      atualizarSprint: (id, dados) => {
        set((state) => ({
          sprints: state.sprints.map((s) =>
            s.id === id ? { ...s, ...dados, dataModificacao: new Date() } : s
          ),
        }));
      },
      
      excluirSprint: (id) => {
        set((state) => ({
          sprints: state.sprints.filter((s) => s.id !== id),
          userStories: state.userStories.map((us) =>
            us.sprint === id ? { ...us, sprint: undefined } : us
          ),
        }));
      },
      
      getSprintsPorProjeto: (projetoId) => {
        return get().sprints.filter((s) => s.projeto === projetoId);
      },
      
      // Issues
      issues: [
        {
          id: 'issue-1',
          ref: 3,
          titulo: 'Teste',
          descricao: 'Teste',
          projeto: 'proj-1',
          tipo: 'bug' as TipoIssue,
          severidade: 'important' as Severidade,
          prioridade: 'baixa' as Prioridade,
          status: 'novo' as StatusIssue,
          tags: [],
          anexos: [],
          comentarios: [],
          atribuido: undefined,
          observadores: [],
          criadoPor: 'user-1',
          dataCriacao: new Date('2026-01-28T07:38:00'),
          dataModificacao: new Date('2026-01-28T07:38:00'),
          ordem: 1,
        },
      ],
      
      adicionarIssue: (issue) => {
        const id = uuidv4();
        const ref = get().proximoRef(issue.projeto);
        const novaIssue: Issue = {
          ...issue,
          id,
          ref,
          comentarios: issue.comentarios || [],
          dataCriacao: new Date(),
          dataModificacao: new Date(),
        };
        set((state) => ({
          issues: [...state.issues, novaIssue],
        }));
        return id;
      },
      
      atualizarIssue: (id, dados) => {
        set((state) => ({
          issues: state.issues.map((i) =>
            i.id === id ? { ...i, ...dados, dataModificacao: new Date() } : i
          ),
        }));
      },
      
      excluirIssue: (id) => {
        set((state) => ({
          issues: state.issues.filter((i) => i.id !== id),
        }));
      },
      
      getIssuesPorProjeto: (projetoId) => {
        return get().issues.filter((i) => i.projeto === projetoId);
      },
      
      // Wiki
      wikiPages: [
        {
          id: 'wiki-1',
          slug: 'home',
          titulo: 'Página Principal',
          conteudo: '',
          projeto: 'proj-1',
          proprietario: 'user-1',
          ultimoModificador: 'user-1',
          dataCriacao: new Date(),
          dataModificacao: new Date(),
          edicoes: 0,
          versao: 1,
          observadores: [],
          totalObservadores: 0,
          anexos: [],
        },
      ],
      
      wikiLinks: [
        {
          id: 'wikilink-1',
          titulo: 'PÁGINA PRINCIPAL',
          href: 'home',
          projeto: 'proj-1',
          ordem: 1,
        },
      ],
      
      adicionarWikiPage: (page) => {
        const id = uuidv4();
        const novaPage: WikiPage = {
          ...page,
          id,
          dataCriacao: new Date(),
          dataModificacao: new Date(),
          edicoes: 0,
          versao: 1,
        };
        set((state) => ({
          wikiPages: [...state.wikiPages, novaPage],
        }));
        return id;
      },
      
      atualizarWikiPage: (id, dados) => {
        set((state) => ({
          wikiPages: state.wikiPages.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...dados,
                  dataModificacao: new Date(),
                  edicoes: p.edicoes + 1,
                  versao: p.versao + 1,
                }
              : p
          ),
        }));
      },
      
      excluirWikiPage: (id) => {
        set((state) => ({
          wikiPages: state.wikiPages.filter((p) => p.id !== id),
        }));
      },
      
      getWikiPagesPorProjeto: (projetoId) => {
        return get().wikiPages.filter((p) => p.projeto === projetoId);
      },
      
      getWikiPagePorSlug: (projetoId, slug) => {
        return get().wikiPages.find(
          (p) => p.projeto === projetoId && p.slug === slug
        );
      },
      
      adicionarWikiLink: (link) => {
        const id = uuidv4();
        const novoLink: WikiLink = { ...link, id };
        set((state) => ({
          wikiLinks: [...state.wikiLinks, novoLink],
        }));
        return id;
      },
      
      atualizarWikiLink: (id, dados) => {
        set((state) => ({
          wikiLinks: state.wikiLinks.map((l) =>
            l.id === id ? { ...l, ...dados } : l
          ),
        }));
      },
      
      excluirWikiLink: (id) => {
        set((state) => ({
          wikiLinks: state.wikiLinks.filter((l) => l.id !== id),
        }));
      },
      
      getWikiLinksPorProjeto: (projetoId) => {
        return get()
          .wikiLinks.filter((l) => l.projeto === projetoId)
          .sort((a, b) => a.ordem - b.ordem);
      },
      
      // Tags
      tags: [],
      
      adicionarTag: (tag) => {
        const id = uuidv4();
        const novaTag: Tag = { ...tag, id };
        set((state) => ({
          tags: [...state.tags, novaTag],
        }));
        return id;
      },
      
      // Contadores de referência
      contadorRef: { 'proj-1': 5 },
      
      proximoRef: (projetoId) => {
        const state = get();
        const atual = state.contadorRef[projetoId] || 0;
        const proximo = atual + 1;
        set({
          contadorRef: { ...state.contadorRef, [projetoId]: proximo },
        });
        return proximo;
      },
      
      // Atividades (Timeline)
      atividades: [],
      
      registrarAtividade: (atividade) => {
        const id = uuidv4();
        const novaAtividade: Atividade = {
          ...atividade,
          id,
          dataCriacao: new Date(),
        };
        set((state) => ({
          atividades: [novaAtividade, ...state.atividades],
        }));
      },
      
      getAtividadesPorProjeto: (projetoId) => {
        return get().atividades
          .filter((a) => a.projeto === projetoId)
          .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());
      },
    }),
    {
      name: 'taiga-scrum-storage',
      partialize: (state) => ({
        projetos: state.projetos,
        userStories: state.userStories,
        tarefas: state.tarefas,
        sprints: state.sprints,
        issues: state.issues,
        wikiPages: state.wikiPages,
        wikiLinks: state.wikiLinks,
        tags: state.tags,
        contadorRef: state.contadorRef,
        usuarioAtual: state.usuarioAtual,
        projetoAtual: state.projetoAtual,
        atividades: state.atividades,
      }),
    }
  )
);
