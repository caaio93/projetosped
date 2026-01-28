'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Filter,
  Search,
  MoreVertical,
  GripVertical,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { cn, formatarData } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import {
  Button,
  Input,
  Modal,
  Textarea,
  Select,
  ProgressBar,
  EmptyState,
  MarkdownEditor,
} from '@/components/ui';
import {
  Dropdown,
  DropdownItem,
  DropdownDivider,
  DropdownSelect,
  MultiSelectDropdown,
} from '@/components/ui/Dropdown';
import { UserStoryDetail } from './UserStoryDetail';
import { SprintManager } from './SprintManager';
import type { UserStory, StatusUserStory } from '@/types';

interface BacklogProps {
  projetoId: string;
}

const STATUS_OPTIONS = [
  { value: 'novo' as StatusUserStory, label: 'Novo', cor: '#70728f' },
  { value: 'emProgresso' as StatusUserStory, label: 'Em Progresso', cor: '#e44057' },
  { value: 'prontoParaTeste' as StatusUserStory, label: 'Pronto para Teste', cor: '#ffc107' },
  { value: 'fechado' as StatusUserStory, label: 'Fechado', cor: '#a8e6cf' },
  { value: 'precisaInfo' as StatusUserStory, label: 'Precisa Info', cor: '#ff9800' },
];

export function Backlog({ projetoId }: BacklogProps) {
  const router = useRouter();
  
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<StatusUserStory[]>([]);
  const [filtroTags, setFiltroTags] = useState<string[]>([]);
  const [mostrarTags, setMostrarTags] = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [userStorySelecionada, setUserStorySelecionada] = useState<UserStory | null>(null);
  const [detalhesAberto, setDetalhesAberto] = useState(false);
  const [selecionados, setSelecionados] = useState<string[]>([]);

  const {
    getBacklog,
    getUserStoriesPorProjeto,
    getSprintsPorProjeto,
    getProjetoAtual,
    adicionarUserStory,
    atualizarUserStory,
    excluirUserStory,
    usuarioAtual,
    tags,
  } = useAppStore();

  const projeto = getProjetoAtual();
  const userStories = getUserStoriesPorProjeto(projetoId);
  const backlog = getBacklog(projetoId);
  const sprints = getSprintsPorProjeto(projetoId);

  const userStoriesFiltradas = backlog.filter((us) => {
    const matchTexto =
      filtroTexto === '' ||
      us.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      us.ref.toString().includes(filtroTexto) ||
      (filtroTexto.startsWith('#') && us.ref === parseInt(filtroTexto.slice(1)));

    const matchStatus = filtroStatus.length === 0 || filtroStatus.includes(us.status);
    const matchTags = filtroTags.length === 0 || us.tags.some((t) => filtroTags.includes(t.id));

    return matchTexto && matchStatus && matchTags;
  });

  const totalPontos = userStories.reduce((acc, us) => acc + (us.totalPontos || 0), 0);
  const pontosFechados = userStories
    .filter((us) => us.status === 'fechado')
    .reduce((acc, us) => acc + (us.totalPontos || 0), 0);
  const pontosNoSprint = userStories
    .filter((us) => us.sprint)
    .reduce((acc, us) => acc + (us.totalPontos || 0), 0);
  // Percentual baseado em User Stories fechadas
  const totalUserStories = userStories.length;
  const userStoriesFechadas = userStories.filter((us) => us.status === 'fechado').length;
  const percentualConcluido = totalUserStories > 0 ? Math.round((userStoriesFechadas / totalUserStories) * 100) : 0;

  const handleNovaUserStory = () => {
    setUserStorySelecionada(null);
    setModalAberto(true);
  };

  const handleAbrirDetalhes = (us: UserStory) => {
    setUserStorySelecionada(us);
    setDetalhesAberto(true);
  };

  const handleMoverParaSprint = (userStoryId: string, sprintId: string | null) => {
    atualizarUserStory(userStoryId, { sprint: sprintId || undefined });
  };

  const handleMoverParaTopo = (userStoryId: string) => {
    const novaOrdem = Math.min(...backlog.map((us) => us.ordem)) - 1;
    atualizarUserStory(userStoryId, { ordem: novaOrdem });
  };

  const handleMoverParaFinal = (userStoryId: string) => {
    const novaOrdem = Math.max(...backlog.map((us) => us.ordem)) + 1;
    atualizarUserStory(userStoryId, { ordem: novaOrdem });
  };

  const handleExcluir = (userStoryId: string) => {
    if (confirm('Tem certeza que deseja excluir esta história de usuário?')) {
      excluirUserStory(userStoryId);
    }
  };

  const handleDuplicar = (us: UserStory) => {
    adicionarUserStory({
      ...us,
      titulo: `${us.titulo} (cópia)`,
      sprint: undefined,
      tarefas: [],
      observadores: [],
      criadoPor: usuarioAtual?.id || '',
      ordem: us.ordem + 0.5,
      ordemKanban: us.ordemKanban,
    });
  };

  const handleSelecionarTodos = () => {
    if (selecionados.length === userStoriesFiltradas.length) {
      setSelecionados([]);
    } else {
      setSelecionados(userStoriesFiltradas.map((us) => us.id));
    }
  };

  const handleIrParaSprint = (sprintId: string) => {
    router.push(`/projeto/${projetoId}/sprint/${sprintId}`);
  };

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-primary-500">Scrum</h1>
          </div>

          <div className="flex items-center gap-6 bg-sidebar text-white rounded-lg px-6 py-3">
            <div className="flex-1">
              <ProgressBar value={percentualConcluido} color="#00afaf" />
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-primary-400 font-semibold">{percentualConcluido}%</span>
              <span>
                <strong className="text-white">{totalPontos}</strong>
                <span className="text-gray-400 ml-1">pontos definidos</span>
              </span>
              <span>
                <strong className="text-white">{pontosFechados}</strong>
                <span className="text-gray-400 ml-1">pontos fechados</span>
              </span>
              <span>
                <strong className="text-white">{pontosNoSprint}</strong>
                <span className="text-gray-400 ml-1">pontos/sprint</span>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border-b px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium transition-colors',
                  mostrarFiltros ? 'text-primary-600' : 'text-primary-500'
                )}
              >
                <Filter className="w-4 h-4" />
                Filtros
                {(filtroStatus.length > 0 || filtroTags.length > 0) && (
                  <span className="px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                    {filtroStatus.length + filtroTags.length}
                  </span>
                )}
              </button>
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="assunto ou #referência"
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={mostrarTags}
                  onChange={(e) => setMostrarTags(e.target.checked)}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                Tags
              </label>
            </div>

            <Button variant="primary" onClick={handleNovaUserStory}>
              <Plus className="w-4 h-4" />
              HISTÓRIA DE USUÁRIO
            </Button>
          </div>

          {mostrarFiltros && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
              <div className="flex-1 max-w-xs">
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Status</label>
                <MultiSelectDropdown
                  values={filtroStatus}
                  onChange={setFiltroStatus}
                  options={STATUS_OPTIONS}
                  placeholder="Todos os status"
                />
              </div>
              <div className="flex-1 max-w-xs">
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Tags</label>
                <MultiSelectDropdown
                  values={filtroTags}
                  onChange={setFiltroTags}
                  options={tags.map((t) => ({ value: t.id, label: t.nome, cor: t.cor }))}
                  placeholder="Todas as tags"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFiltroStatus([]);
                  setFiltroTags([]);
                }}
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800">Backlog</h2>
                <span className="text-sm text-gray-500">{userStoriesFiltradas.length} histórias</span>
              </div>
              {selecionados.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">{selecionados.length} selecionadas</span>
                  <Dropdown
                    trigger={
                      <Button variant="secondary" size="sm">
                        Ações em lote
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    }
                  >
                    <DropdownItem
                      onClick={() => {
                        selecionados.forEach((id) => handleMoverParaSprint(id, sprints[0]?.id || null));
                        setSelecionados([]);
                      }}
                    >
                      Mover para Sprint
                    </DropdownItem>
                    <DropdownItem
                      danger
                      onClick={() => {
                        if (confirm(`Excluir ${selecionados.length} histórias?`)) {
                          selecionados.forEach((id) => excluirUserStory(id));
                          setSelecionados([]);
                        }
                      }}
                    >
                      Excluir selecionadas
                    </DropdownItem>
                  </Dropdown>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border">
              <div className="flex items-center px-4 py-3 border-b bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <div className="w-8">
                  <input
                    type="checkbox"
                    checked={selecionados.length === userStoriesFiltradas.length && userStoriesFiltradas.length > 0}
                    onChange={handleSelecionarTodos}
                    className="rounded border-gray-300 text-primary-500"
                  />
                </div>
                <div className="w-8" />
                <div className="flex-1">História de Usuário</div>
                <div className="w-24 text-center">Status</div>
                <div className="w-24 text-center">Sprint</div>
                <div className="w-20 text-right">Pontos</div>
                <div className="w-8" />
              </div>

              {userStoriesFiltradas.length === 0 ? (
                <EmptyState
                  title="Backlog vazio"
                  description={
                    filtroTexto || filtroStatus.length > 0
                      ? 'Nenhuma história corresponde aos filtros.'
                      : 'Adicione histórias de usuário para começar.'
                  }
                  action={
                    filtroTexto || filtroStatus.length > 0 ? (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setFiltroTexto('');
                          setFiltroStatus([]);
                          setFiltroTags([]);
                        }}
                      >
                        Limpar filtros
                      </Button>
                    ) : (
                      <Button variant="primary" onClick={handleNovaUserStory}>
                        <Plus className="w-4 h-4" />
                        Nova História
                      </Button>
                    )
                  }
                />
              ) : (
                userStoriesFiltradas
                  .sort((a, b) => a.ordem - b.ordem)
                  .map((us) => (
                    <div
                      key={us.id}
                      className={cn(
                        'flex items-center px-4 py-3 border-b hover:bg-gray-50 transition-colors group',
                        selecionados.includes(us.id) && 'bg-primary-50'
                      )}
                    >
                      <div className="w-8">
                        <input
                          type="checkbox"
                          checked={selecionados.includes(us.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelecionados([...selecionados, us.id]);
                            } else {
                              setSelecionados(selecionados.filter((id) => id !== us.id));
                            }
                          }}
                          className="rounded border-gray-300 text-primary-500"
                        />
                      </div>
                      <div className="w-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 cursor-pointer" onClick={() => handleAbrirDetalhes(us)}>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-sm">#{us.ref}</span>
                          <span className="font-medium text-gray-800 hover:text-primary-500">{us.titulo}</span>
                        </div>
                        {mostrarTags && us.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {us.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="px-2 py-0.5 text-xs rounded"
                                style={{ backgroundColor: tag.cor + '20', color: tag.cor }}
                              >
                                {tag.nome}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="w-24 text-center">
                        <DropdownSelect
                          value={us.status}
                          onChange={(value) => atualizarUserStory(us.id, { status: value })}
                          options={STATUS_OPTIONS}
                          className="text-xs"
                        />
                      </div>
                      <div className="w-24 text-center">
                        <select
                          value={us.sprint || ''}
                          onChange={(e) => handleMoverParaSprint(us.id, e.target.value || null)}
                          className="text-xs border rounded px-2 py-1 bg-white"
                        >
                          <option value="">Backlog</option>
                          {sprints.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-20 text-right">
                        <span
                          className={cn(
                            'inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded text-xs font-semibold',
                            us.totalPontos > 0 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-400'
                          )}
                        >
                          {us.totalPontos > 0 ? us.totalPontos : '?'}
                        </span>
                      </div>
                      <div className="w-8">
                        <Dropdown
                          trigger={
                            <button className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          }
                          align="right"
                        >
                          <DropdownItem icon={<ExternalLink className="w-4 h-4" />} onClick={() => handleAbrirDetalhes(us)}>
                            Abrir detalhes
                          </DropdownItem>
                          <DropdownDivider />
                          <DropdownItem icon={<ArrowUp className="w-4 h-4" />} onClick={() => handleMoverParaTopo(us.id)}>
                            Mover para o topo
                          </DropdownItem>
                          <DropdownItem icon={<ArrowDown className="w-4 h-4" />} onClick={() => handleMoverParaFinal(us.id)}>
                            Mover para o final
                          </DropdownItem>
                          <DropdownDivider />
                          <DropdownItem icon={<Copy className="w-4 h-4" />} onClick={() => handleDuplicar(us)}>
                            Duplicar
                          </DropdownItem>
                          <DropdownItem icon={<Trash2 className="w-4 h-4" />} danger onClick={() => handleExcluir(us.id)}>
                            Excluir
                          </DropdownItem>
                        </Dropdown>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-80 bg-gray-50 border-l overflow-y-auto">
        <div className="p-4">
          <SprintManager projetoId={projetoId} onSelectSprint={handleIrParaSprint} />
        </div>
      </div>

      <NovaUserStoryModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        projetoId={projetoId}
        categoriasPontos={projeto?.categoriaPontos || []}
      />

      {detalhesAberto && userStorySelecionada && (
        <UserStoryDetail
          userStory={userStorySelecionada}
          onClose={() => setDetalhesAberto(false)}
          projetoId={projetoId}
        />
      )}
    </div>
  );
}

interface NovaUserStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projetoId: string;
  categoriasPontos: { id: string; nome: string; ordem: number }[];
}

function NovaUserStoryModal({ isOpen, onClose, projetoId, categoriasPontos }: NovaUserStoryModalProps) {
  const { adicionarUserStory, usuarioAtual, getBacklog } = useAppStore();
  const backlog = getBacklog(projetoId);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [pontos, setPontos] = useState<Record<string, number | null>>({});
  const [localizacao, setLocalizacao] = useState<'bottom' | 'top'>('bottom');

  const handleSalvar = () => {
    const pontosArray = categoriasPontos.map((cat) => ({
      categoria: cat.id,
      valor: pontos[cat.id] ?? null,
    }));

    const totalPontos = pontosArray.reduce((acc, p) => acc + (p.valor || 0), 0);
    const ordemBase =
      localizacao === 'top'
        ? Math.min(...backlog.map((us) => us.ordem), 0) - 1
        : Math.max(...backlog.map((us) => us.ordem), 0) + 1;

    adicionarUserStory({
      titulo,
      descricao,
      projeto: projetoId,
      status: 'novo',
      pontos: pontosArray,
      totalPontos,
      tarefas: [],
      tags: [],
      anexos: [],
      atribuidos: [],
      observadores: [],
      criadoPor: usuarioAtual?.id || '',
      ordem: ordemBase,
      ordemKanban: ordemBase,
    });

    onClose();
    setTitulo('');
    setDescricao('');
    setPontos({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova história de usuário"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSalvar} disabled={!titulo.trim()}>
            CRIAR
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <Input
            placeholder="Título *"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="text-lg font-medium"
            autoFocus
          />
          <button className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600">
            <Plus className="w-4 h-4" />
            Adicionar tag
          </button>
          <div>
            <MarkdownEditor
              placeholder="Adicione texto descritivo para ajudar outros a entender melhor esta história"
              value={descricao}
              onChange={setDescricao}
              rows={6}
              showHelp={false}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Select defaultValue="novo" disabled>
            <option value="novo">Novo</option>
          </Select>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LOCALIZAÇÃO</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="localizacao"
                  checked={localizacao === 'bottom'}
                  onChange={() => setLocalizacao('bottom')}
                  className="text-primary-500"
                />
                no final
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="localizacao"
                  checked={localizacao === 'top'}
                  onChange={() => setLocalizacao('top')}
                  className="text-primary-500"
                />
                no topo
              </label>
            </div>
          </div>

          <button className="text-sm text-primary-500 hover:text-primary-600">Atribuir ou Atribuir a mim</button>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PONTOS</label>
            <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
              {categoriasPontos.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{cat.nome}</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="?"
                    value={pontos[cat.id] ?? ''}
                    onChange={(e) =>
                      setPontos({
                        ...pontos,
                        [cat.id]: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="w-16 text-center"
                  />
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium text-gray-700">total de pontos</span>
                <span className="text-sm font-semibold">
                  {Object.values(pontos).reduce((acc: number, v) => acc + (v || 0), 0) || '?'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
