'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Filter, Search, MoreVertical, Smile, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { cn, formatarData } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useHydration } from '@/lib/useHydration';
import { Button, Input, Badge, Modal, Textarea, Avatar, ProgressBar, MarkdownEditor } from '@/components/ui';
import type { Tarefa, UserStory, StatusTarefa } from '@/types';

interface SprintTaskboardProps {
  sprintId: string;
  projetoId: string;
}

const COLUNAS: { id: StatusTarefa; label: string; cor: string }[] = [
  { id: 'novo', label: 'NOVO', cor: '#70728f' },
  { id: 'emProgresso', label: 'EM PROGRESSO', cor: '#e44057' },
  { id: 'prontoParaTeste', label: 'PRONTO PARA TESTE', cor: '#ffc107' },
  { id: 'fechado', label: 'FECHADO', cor: '#a8e6cf' },
  { id: 'precisaInfo', label: 'PRECISA DE INFO', cor: '#ff9800' },
];

export function SprintTaskboard({ sprintId, projetoId }: SprintTaskboardProps) {
  const hydrated = useHydration();
  const [filtroTexto, setFiltroTexto] = useState('');
  const [zoomDetalhado, setZoomDetalhado] = useState(true);
  const [tarefaArrastando, setTarefaArrastando] = useState<Tarefa | null>(null);
  const [modalTarefaAberto, setModalTarefaAberto] = useState(false);
  const [userStorySelecionada, setUserStorySelecionada] = useState<string | null>(null);
  const [tarefaEditando, setTarefaEditando] = useState<Tarefa | null>(null);
  const [tarefaAtribuindo, setTarefaAtribuindo] = useState<Tarefa | null>(null);
  const [tarefaDetalhes, setTarefaDetalhes] = useState<Tarefa | null>(null);

  const {
    sprints,
    getUserStoriesPorSprint,
    getTarefasPorSprint,
    getTarefasSemHistoria,
    getTarefasPorUserStory,
    atualizarTarefa,
    adicionarTarefa,
    usuarioAtual,
  } = useAppStore();

  const sprint = sprints.find((s) => s.id === sprintId);
  const userStories = getUserStoriesPorSprint(sprintId);
  const todasTarefas = getTarefasPorSprint(sprintId);
  const tarefasSemHistoria = getTarefasSemHistoria(sprintId);

  // Calcular métricas
  const totalPontos = userStories.reduce((acc, us) => acc + (us.totalPontos || 0), 0);
  const pontosCompletados = userStories
    .filter((us) => us.status === 'fechado')
    .reduce((acc, us) => acc + (us.totalPontos || 0), 0);
  const tarefasAbertas = todasTarefas.filter((t) => t.status !== 'fechado').length;
  const tarefasFechadas = todasTarefas.filter((t) => t.status === 'fechado').length;
  const totalTarefas = todasTarefas.length;
  // Percentual baseado em tarefas fechadas (mais preciso para acompanhamento diário)
  const percentual = totalTarefas > 0 ? Math.round((tarefasFechadas / totalTarefas) * 100) : 0;

  // Sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const tarefa = todasTarefas.find((t) => t.id === event.active.id);
    if (tarefa) {
      setTarefaArrastando(tarefa);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setTarefaArrastando(null);

    if (!over) return;

    const tarefaId = active.id as string;
    const overId = over.id as string;

    // Verificar se o drop foi em uma coluna
    const colunaDestino = COLUNAS.find((c) => c.id === overId);
    if (colunaDestino) {
      atualizarTarefa(tarefaId, { status: colunaDestino.id });
      return;
    }

    // Se o drop foi em outra tarefa, pegar o status dessa tarefa
    const tarefaDestino = todasTarefas.find((t) => t.id === overId);
    if (tarefaDestino && tarefaDestino.id !== tarefaId) {
      atualizarTarefa(tarefaId, { status: tarefaDestino.status });
    }
  };

  const handleNovaTarefa = (userStoryId: string | null) => {
    setUserStorySelecionada(userStoryId);
    setModalTarefaAberto(true);
  };

  const handleEditarTarefa = (tarefa: Tarefa) => {
    setTarefaEditando(tarefa);
  };

  const handleAtribuirTarefa = (tarefa: Tarefa) => {
    setTarefaAtribuindo(tarefa);
  };

  const handleVerDetalhes = (tarefa: Tarefa) => {
    setTarefaDetalhes(tarefa);
  };

  if (!hydrated) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (!sprint) {
    return <div className="p-6">Sprint não encontrado</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header do Sprint */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-primary-500">{sprint.nome}</h1>
            <p className="text-sm text-gray-500">
              {formatarData(sprint.dataInicio)} até {formatarData(sprint.dataFim)}
            </p>
          </div>
        </div>

        {/* Métricas */}
        <div className="flex items-center gap-6 bg-sidebar text-white rounded-lg px-6 py-3">
          <div className="flex-1">
            <ProgressBar value={percentual} color="#00afaf" />
          </div>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-primary-400 font-semibold">{percentual}%</span>
            <span>
              <strong>{totalPontos}</strong>
              <span className="text-gray-400 ml-1">pontos totais</span>
            </span>
            <span>
              <strong>{pontosCompletados}</strong>
              <span className="text-gray-400 ml-1">pontos completados</span>
            </span>
            <span>
              <strong>{tarefasAbertas}</strong>
              <span className="text-gray-400 ml-1">tarefas abertas</span>
            </span>
            <span>
              <strong>{tarefasFechadas}</strong>
              <span className="text-gray-400 ml-1">tarefas fechadas</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filtros e controles */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-primary-500 text-sm font-medium">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="assunto ou referência"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">ZOOM:</span>
          <div className="flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setZoomDetalhado(false)}
              className={cn(
                'px-3 py-1 text-sm rounded-full transition-colors',
                !zoomDetalhado && 'bg-white shadow'
              )}
            >
              Compacto
            </button>
            <button
              onClick={() => setZoomDetalhado(true)}
              className={cn(
                'px-3 py-1 text-sm rounded-full transition-colors',
                zoomDetalhado && 'bg-primary-500 text-white'
              )}
            >
              Detalhado
            </button>
          </div>
        </div>
      </div>

      {/* Taskboard */}
      <div className="flex-1 overflow-auto p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="min-w-max">
            {/* Header das colunas */}
            <div className="flex gap-2 mb-2">
              <div className="w-64 flex-shrink-0 px-3 py-2 font-semibold text-sm text-gray-700">
                HISTÓRIA DE USUÁRIO
              </div>
              {COLUNAS.map((coluna) => (
                <div
                  key={coluna.id}
                  className="w-48 flex-shrink-0 px-3 py-2 font-semibold text-xs text-gray-600 border-t-2"
                  style={{ borderColor: coluna.cor }}
                >
                  {coluna.label}
                </div>
              ))}
            </div>

            {/* Linhas de User Stories */}
            {userStories.map((us) => (
              <UserStoryRow
                key={us.id}
                userStory={us}
                tarefas={getTarefasPorUserStory(us.id).filter((t) => t.sprint === sprintId)}
                colunas={COLUNAS}
                onNovaTarefa={() => handleNovaTarefa(us.id)}
                zoomDetalhado={zoomDetalhado}
                onEditar={handleEditarTarefa}
                onAtribuir={handleAtribuirTarefa}
                onVerDetalhes={handleVerDetalhes}
              />
            ))}

            {/* Linha de tarefas sem história */}
            <div className="flex gap-2 border-t border-gray-200 pt-2 mt-2">
              <div className="w-64 flex-shrink-0 px-3 py-2">
                <div className="flex items-center gap-2">
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Tarefas sem história</span>
                  <button
                    onClick={() => handleNovaTarefa(null)}
                    className="ml-2 p-1 text-gray-400 hover:text-primary-500 hover:bg-gray-100 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                    <Settings2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {COLUNAS.map((coluna) => (
                <SortableContext
                  key={coluna.id}
                  items={tarefasSemHistoria.filter((t) => t.status === coluna.id).map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <TaskColumn
                    id={coluna.id}
                    tarefas={tarefasSemHistoria.filter((t) => t.status === coluna.id)}
                    zoomDetalhado={zoomDetalhado}
                    onEditar={handleEditarTarefa}
                    onAtribuir={handleAtribuirTarefa}
                    onVerDetalhes={handleVerDetalhes}
                  />
                </SortableContext>
              ))}
            </div>
          </div>

          {/* Issues do Sprint */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t-4 border-primary-400">
            <span className="text-sm font-medium text-gray-600">ISSUES DO SPRINT</span>
            <label className="flex items-center gap-2 text-sm text-gray-500 ml-4">
              <input type="checkbox" className="rounded border-gray-300 text-primary-500" />
              Tags
            </label>
            <div className="flex-1" />
            <button className="p-1 text-gray-400 hover:text-primary-500">
              <Plus className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <Settings2 className="w-4 h-4" />
            </button>
          </div>

          <DragOverlay>
            {tarefaArrastando && (
              <TaskCard tarefa={tarefaArrastando} isDragging zoomDetalhado={zoomDetalhado} />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modal Nova Tarefa */}
      <NovaTarefaModal
        isOpen={modalTarefaAberto}
        onClose={() => setModalTarefaAberto(false)}
        userStoryId={userStorySelecionada}
        sprintId={sprintId}
        projetoId={projetoId}
      />

      {/* Modal Editar Tarefa */}
      <EditarTarefaModal
        isOpen={!!tarefaEditando}
        onClose={() => setTarefaEditando(null)}
        tarefa={tarefaEditando}
      />

      {/* Modal Atribuir Tarefa */}
      <AtribuirTarefaModal
        isOpen={!!tarefaAtribuindo}
        onClose={() => setTarefaAtribuindo(null)}
        tarefa={tarefaAtribuindo}
      />

      {/* Modal Detalhes da Tarefa */}
      <DetalhesTarefaModal
        isOpen={!!tarefaDetalhes}
        onClose={() => setTarefaDetalhes(null)}
        tarefa={tarefaDetalhes}
        onEditar={() => {
          if (tarefaDetalhes) {
            setTarefaDetalhes(null);
            setTarefaEditando(tarefaDetalhes);
          }
        }}
      />
    </div>
  );
}

// ==========================================
// USER STORY ROW
// ==========================================
interface UserStoryRowProps {
  userStory: UserStory;
  tarefas: Tarefa[];
  colunas: typeof COLUNAS;
  onNovaTarefa: () => void;
  zoomDetalhado: boolean;
  onEditar: (tarefa: Tarefa) => void;
  onAtribuir: (tarefa: Tarefa) => void;
  onVerDetalhes: (tarefa: Tarefa) => void;
}

function UserStoryRow({ userStory, tarefas, colunas, onNovaTarefa, zoomDetalhado, onEditar, onAtribuir, onVerDetalhes }: UserStoryRowProps) {
  const [expandido, setExpandido] = useState(true);

  return (
    <div className="flex gap-2 mb-2">
      {/* User Story Info */}
      <div className="w-64 flex-shrink-0 px-3 py-2 bg-gray-50 rounded-l">
        <div className="flex items-center gap-2">
          <button onClick={() => setExpandido(!expandido)}>
            {expandido ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">#{userStory.ref}</span>
              <span className="text-sm font-medium text-gray-800 truncate">
                {userStory.titulo}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded">
                {userStory.totalPontos} pts
              </span>
              <span className="text-xs text-gray-400 uppercase">
                {userStory.status === 'novo' ? 'NEW' : userStory.status}
              </span>
            </div>
          </div>
          <button
            onClick={onNovaTarefa}
            className="p-1 text-gray-400 hover:text-primary-500 hover:bg-white rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white rounded">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Colunas de tarefas */}
      {colunas.map((coluna) => (
        <SortableContext
          key={coluna.id}
          items={tarefas.filter((t) => t.status === coluna.id).map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <TaskColumn
            id={coluna.id}
            tarefas={tarefas.filter((t) => t.status === coluna.id)}
            zoomDetalhado={zoomDetalhado}
            onEditar={onEditar}
            onAtribuir={onAtribuir}
            onVerDetalhes={onVerDetalhes}
          />
        </SortableContext>
      ))}
    </div>
  );
}

// ==========================================
// TASK COLUMN
// ==========================================
interface TaskColumnProps {
  id: string;
  tarefas: Tarefa[];
  zoomDetalhado: boolean;
  onEditar: (tarefa: Tarefa) => void;
  onAtribuir: (tarefa: Tarefa) => void;
  onVerDetalhes: (tarefa: Tarefa) => void;
}

function TaskColumn({ id, tarefas, zoomDetalhado, onEditar, onAtribuir, onVerDetalhes }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "w-48 flex-shrink-0 bg-gray-100 rounded p-2 min-h-[80px] space-y-2 transition-colors",
        isOver && "bg-primary-100 ring-2 ring-primary-400"
      )}
    >
      {tarefas.map((tarefa) => (
        <SortableTaskCard
          key={tarefa.id}
          tarefa={tarefa}
          zoomDetalhado={zoomDetalhado}
          onEditar={onEditar}
          onAtribuir={onAtribuir}
          onVerDetalhes={onVerDetalhes}
        />
      ))}
    </div>
  );
}

// ==========================================
// SORTABLE TASK CARD
// ==========================================
interface SortableTaskCardProps {
  tarefa: Tarefa;
  zoomDetalhado: boolean;
  onEditar: (tarefa: Tarefa) => void;
  onAtribuir: (tarefa: Tarefa) => void;
  onVerDetalhes: (tarefa: Tarefa) => void;
}

function SortableTaskCard({ tarefa, zoomDetalhado, onEditar, onAtribuir, onVerDetalhes }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tarefa.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard 
        tarefa={tarefa} 
        isDragging={isDragging} 
        zoomDetalhado={zoomDetalhado}
        onEditar={onEditar}
        onAtribuir={onAtribuir}
        onVerDetalhes={onVerDetalhes}
      />
    </div>
  );
}

// ==========================================
// TASK CARD
// ==========================================
interface TaskCardProps {
  tarefa: Tarefa;
  isDragging?: boolean;
  zoomDetalhado: boolean;
  onEditar?: (tarefa: Tarefa) => void;
  onExcluir?: (tarefaId: string) => void;
  onAtribuir?: (tarefa: Tarefa) => void;
  onMoverTopo?: (tarefaId: string) => void;
  onVerDetalhes?: (tarefa: Tarefa) => void;
}

function TaskCard({ tarefa, isDragging, zoomDetalhado, onEditar, onExcluir, onAtribuir, onMoverTopo, onVerDetalhes }: TaskCardProps) {
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { excluirTarefa, atualizarTarefa } = useAppStore();

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAberto(false);
      }
    }

    if (menuAberto) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuAberto]);

  const handleEditar = () => {
    setMenuAberto(false);
    if (onEditar) onEditar(tarefa);
  };

  const handleAtribuir = () => {
    setMenuAberto(false);
    if (onAtribuir) onAtribuir(tarefa);
  };

  const handleExcluir = () => {
    setMenuAberto(false);
    if (confirm(`Tem certeza que deseja excluir a tarefa "${tarefa.titulo}"?`)) {
      excluirTarefa(tarefa.id);
    }
  };

  const handleMoverTopo = () => {
    setMenuAberto(false);
    atualizarTarefa(tarefa.id, { ordem: 0 });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Não abrir detalhes se clicar no menu ou em botões
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[data-menu]')) {
      return;
    }
    if (onVerDetalhes) onVerDetalhes(tarefa);
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow',
        isDragging && 'shadow-lg ring-2 ring-primary-500 opacity-80'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">#{tarefa.ref}</span>
            <span className={cn('text-sm font-medium text-gray-800', !zoomDetalhado && 'truncate')}>
              {tarefa.titulo}
            </span>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setMenuAberto(!menuAberto);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuAberto && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border py-1 z-10">
              <button
                onClick={(e) => { e.stopPropagation(); handleEditar(); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Editar card
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleAtribuir(); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Atribuir
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleExcluir(); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
              >
                Excluir card
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleMoverTopo(); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Mover para o topo
              </button>
            </div>
          )}
        </div>
      </div>
      {zoomDetalhado && (
        <div className="flex items-center gap-2 mt-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
            <Smile className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MODAL NOVA TAREFA
// ==========================================
interface NovaTarefaModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStoryId: string | null;
  sprintId: string;
  projetoId: string;
}

function NovaTarefaModal({ isOpen, onClose, userStoryId, sprintId, projetoId }: NovaTarefaModalProps) {
  const { adicionarTarefa, usuarioAtual } = useAppStore();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');

  const handleSalvar = () => {
    adicionarTarefa({
      titulo,
      descricao,
      projeto: projetoId,
      userStory: userStoryId || undefined,
      sprint: sprintId,
      status: 'novo',
      tags: [],
      anexos: [],
      atribuido: undefined,
      observadores: [],
      criadoPor: usuarioAtual?.id || '',
      ordem: 999,
    });

    onClose();
    setTitulo('');
    setDescricao('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova Tarefa"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSalvar} disabled={!titulo}>
            Criar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <Input
            placeholder="Digite o título da tarefa"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <Textarea
            placeholder="Descrição opcional"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={4}
          />
        </div>
      </div>
    </Modal>
  );
}

// ==========================================
// MODAL EDITAR TAREFA
// ==========================================
interface EditarTarefaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tarefa: Tarefa | null;
}

function EditarTarefaModal({ isOpen, onClose, tarefa }: EditarTarefaModalProps) {
  const { atualizarTarefa } = useAppStore();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    if (tarefa) {
      setTitulo(tarefa.titulo);
      setDescricao(tarefa.descricao || '');
    }
  }, [tarefa]);

  const handleSalvar = () => {
    if (tarefa) {
      atualizarTarefa(tarefa.id, { titulo, descricao });
      onClose();
    }
  };

  if (!tarefa) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Tarefa"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSalvar} disabled={!titulo}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <Input
            placeholder="Digite o título da tarefa"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <MarkdownEditor
            placeholder="Descrição opcional"
            value={descricao}
            onChange={setDescricao}
            rows={4}
            showHelp={false}
          />
        </div>
      </div>
    </Modal>
  );
}

// ==========================================
// MODAL ATRIBUIR TAREFA
// ==========================================
interface AtribuirTarefaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tarefa: Tarefa | null;
}

function AtribuirTarefaModal({ isOpen, onClose, tarefa }: AtribuirTarefaModalProps) {
  const { atualizarTarefa, usuarioAtual } = useAppStore();

  const handleAtribuirParaMim = () => {
    if (tarefa && usuarioAtual) {
      atualizarTarefa(tarefa.id, { atribuido: usuarioAtual.id });
      onClose();
    }
  };

  const handleRemoverAtribuicao = () => {
    if (tarefa) {
      atualizarTarefa(tarefa.id, { atribuido: undefined });
      onClose();
    }
  };

  if (!tarefa) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Atribuir Tarefa"
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Tarefa: <strong>{tarefa.titulo}</strong>
        </p>
        <div className="flex flex-col gap-2">
          <Button variant="primary" onClick={handleAtribuirParaMim} className="w-full">
            Atribuir para mim
          </Button>
          {tarefa.atribuido && (
            <Button variant="secondary" onClick={handleRemoverAtribuicao} className="w-full">
              Remover atribuição
            </Button>
          )}
          <Button variant="secondary" onClick={onClose} className="w-full">
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ==========================================
// MODAL DETALHES DA TAREFA
// ==========================================
interface DetalhesTarefaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tarefa: Tarefa | null;
  onEditar: () => void;
}

function DetalhesTarefaModal({ isOpen, onClose, tarefa, onEditar }: DetalhesTarefaModalProps) {
  const { atualizarTarefa, usuarioAtual } = useAppStore();

  if (!tarefa) return null;

  const STATUS_OPTIONS = [
    { value: 'novo', label: 'Novo', cor: '#70728f' },
    { value: 'emProgresso', label: 'Em Progresso', cor: '#e44057' },
    { value: 'prontoParaTeste', label: 'Pronto para Teste', cor: '#ffc107' },
    { value: 'fechado', label: 'Fechado', cor: '#a8e6cf' },
    { value: 'precisaInfo', label: 'Precisa de Info', cor: '#ff9800' },
  ];

  const statusAtual = STATUS_OPTIONS.find(s => s.value === tarefa.status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`#${tarefa.ref} - ${tarefa.titulo}`}
      size="lg"
      footer={
        <div className="flex justify-between w-full">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          <Button variant="primary" onClick={onEditar}>
            Editar
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="col-span-2 space-y-4">
          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            {tarefa.descricao ? (
              <div 
                className="prose prose-sm max-w-none p-3 bg-gray-50 rounded-lg"
                dangerouslySetInnerHTML={{ __html: tarefa.descricao }}
              />
            ) : (
              <p className="text-gray-400 italic p-3 bg-gray-50 rounded-lg">Sem descrição</p>
            )}
          </div>

          {/* Anexos */}
          {tarefa.anexos && tarefa.anexos.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Anexos</label>
              <div className="space-y-2">
                {tarefa.anexos.map((anexo) => (
                  <div key={anexo.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{anexo.nome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Status</label>
            <select
              value={tarefa.status}
              onChange={(e) => atualizarTarefa(tarefa.id, { status: e.target.value as StatusTarefa })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Atribuído */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Atribuído</label>
            {tarefa.atribuido ? (
              <div className="flex items-center gap-2">
                <Avatar nome={usuarioAtual?.nomeCompleto || 'Usuário'} size="sm" />
                <span className="text-sm text-gray-700">{usuarioAtual?.nomeCompleto || 'Usuário'}</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (usuarioAtual) {
                    atualizarTarefa(tarefa.id, { atribuido: usuarioAtual.id });
                  }
                }}
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                Atribuir a mim
              </button>
            )}
          </div>

          {/* Data de criação */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Criado em</label>
            <span className="text-sm text-gray-700">{formatarData(tarefa.dataCriacao)}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
