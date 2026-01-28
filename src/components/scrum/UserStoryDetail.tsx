'use client';

import { useState, useEffect } from 'react';
import {
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Paperclip,
  Eye,
  EyeOff,
  Clock,
  Lock,
  Unlock,
  MessageSquare,
  History,
  Tag,
  User,
  Trash2,
  Edit,
  MoreHorizontal,
} from 'lucide-react';
import { cn, formatarData, formatarDataHora, formatarTamanhoArquivo } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Button, Input, Textarea, Select, Avatar, Badge, Modal } from '@/components/ui';
import type { UserStory, Tarefa, StatusUserStory, Tag as TagType, Anexo, Comentario } from '@/types';

const STATUS_OPTIONS: { value: StatusUserStory; label: string; cor: string }[] = [
  { value: 'novo', label: 'Novo', cor: '#70728f' },
  { value: 'emProgresso', label: 'Em Progresso', cor: '#e44057' },
  { value: 'prontoParaTeste', label: 'Pronto para Teste', cor: '#ffc107' },
  { value: 'fechado', label: 'Fechado', cor: '#a8e6cf' },
  { value: 'precisaInfo', label: 'Precisa de Informação', cor: '#ff9800' },
];

interface UserStoryDetailProps {
  userStory: UserStory;
  onClose: () => void;
  projetoId: string;
}

export function UserStoryDetail({ userStory, onClose, projetoId }: UserStoryDetailProps) {
  const [abaAtiva, setAbaAtiva] = useState<'descricao' | 'tarefas' | 'anexos' | 'atividade'>('descricao');
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [editandoDescricao, setEditandoDescricao] = useState(false);
  const [titulo, setTitulo] = useState(userStory.titulo);
  const [descricao, setDescricao] = useState(userStory.descricao);
  const [status, setStatus] = useState(userStory.status);
  const [novoComentario, setNovoComentario] = useState('');
  const [novaTag, setNovaTag] = useState('');
  const [mostrarFormTag, setMostrarFormTag] = useState(false);
  const [isObservando, setIsObservando] = useState(false);
  const [isBloqueado, setIsBloqueado] = useState(false);

  const {
    atualizarUserStory,
    getTarefasPorUserStory,
    adicionarTarefa,
    getProjetoAtual,
    usuarioAtual,
  } = useAppStore();

  const projeto = getProjetoAtual();
  const tarefas = getTarefasPorUserStory(userStory.id);

  // Atualizar status
  const handleStatusChange = (novoStatus: StatusUserStory) => {
    setStatus(novoStatus);
    atualizarUserStory(userStory.id, { status: novoStatus });
  };

  // Salvar título
  const handleSalvarTitulo = () => {
    atualizarUserStory(userStory.id, { titulo });
    setEditandoTitulo(false);
  };

  // Salvar descrição
  const handleSalvarDescricao = () => {
    atualizarUserStory(userStory.id, { descricao });
    setEditandoDescricao(false);
  };

  // Adicionar tag
  const handleAdicionarTag = () => {
    if (novaTag.trim()) {
      const novaTags = [...userStory.tags, { id: Date.now().toString(), nome: novaTag.trim(), cor: '#' + Math.floor(Math.random()*16777215).toString(16) }];
      atualizarUserStory(userStory.id, { tags: novaTags });
      setNovaTag('');
      setMostrarFormTag(false);
    }
  };

  // Remover tag
  const handleRemoverTag = (tagId: string) => {
    const novaTags = userStory.tags.filter(t => t.id !== tagId);
    atualizarUserStory(userStory.id, { tags: novaTags });
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Painel lateral */}
      <div className="relative ml-auto w-full max-w-4xl bg-white shadow-xl flex flex-col h-full animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-mono">#{userStory.ref}</span>
            {editandoTitulo ? (
              <div className="flex items-center gap-2">
                <Input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="text-lg font-semibold"
                  autoFocus
                />
                <Button variant="primary" size="sm" onClick={handleSalvarTitulo}>
                  Salvar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditandoTitulo(false)}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <h2
                className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-primary-500"
                onClick={() => setEditandoTitulo(true)}
              >
                {titulo}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsObservando(!isObservando)}
              className={cn(
                'p-2 rounded-full transition-colors',
                isObservando ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:bg-gray-100'
              )}
              title={isObservando ? 'Parar de observar' : 'Observar'}
            >
              {isObservando ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsBloqueado(!isBloqueado)}
              className={cn(
                'p-2 rounded-full transition-colors',
                isBloqueado ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:bg-gray-100'
              )}
              title={isBloqueado ? 'Desbloquear' : 'Bloquear'}
            >
              {isBloqueado ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 overflow-auto">
          <div className="flex">
            {/* Coluna principal */}
            <div className="flex-1 p-6 border-r">
              {/* Tags */}
              <div className="mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {userStory.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm"
                      style={{ backgroundColor: tag.cor + '20', color: tag.cor }}
                    >
                      {tag.nome}
                      <button
                        onClick={() => handleRemoverTag(tag.id)}
                        className="hover:bg-black/10 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {mostrarFormTag ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={novaTag}
                        onChange={(e) => setNovaTag(e.target.value)}
                        placeholder="Nome da tag"
                        className="w-32 h-8 text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdicionarTag()}
                      />
                      <Button variant="primary" size="sm" onClick={handleAdicionarTag}>
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setMostrarFormTag(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setMostrarFormTag(true)}
                      className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar tag
                    </button>
                  )}
                </div>
              </div>

              {/* Abas */}
              <div className="flex border-b mb-4">
                {[
                  { id: 'descricao', label: 'Descrição', icon: Edit },
                  { id: 'tarefas', label: `Tarefas (${tarefas.length})`, icon: MessageSquare },
                  { id: 'anexos', label: `Anexos (${userStory.anexos.length})`, icon: Paperclip },
                  { id: 'atividade', label: 'Atividade', icon: History },
                ].map((aba) => (
                  <button
                    key={aba.id}
                    onClick={() => setAbaAtiva(aba.id as typeof abaAtiva)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                      abaAtiva === aba.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <aba.icon className="w-4 h-4" />
                    {aba.label}
                  </button>
                ))}
              </div>

              {/* Conteúdo das abas */}
              {abaAtiva === 'descricao' && (
                <div>
                  {editandoDescricao ? (
                    <div>
                      <Textarea
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        rows={10}
                        placeholder="Adicione uma descrição..."
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">Markdown suportado</span>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setEditandoDescricao(false)}>
                            Cancelar
                          </Button>
                          <Button variant="primary" size="sm" onClick={handleSalvarDescricao}>
                            Salvar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setEditandoDescricao(true)}
                      className="min-h-[200px] p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      {descricao ? (
                        <div className="prose prose-sm max-w-none">{descricao}</div>
                      ) : (
                        <p className="text-gray-400 italic">
                          Clique para adicionar uma descrição...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {abaAtiva === 'tarefas' && (
                <TarefasSection
                  userStoryId={userStory.id}
                  sprintId={userStory.sprint}
                  projetoId={projetoId}
                  tarefas={tarefas}
                />
              )}

              {abaAtiva === 'anexos' && (
                <AnexosSection anexos={userStory.anexos} />
              )}

              {abaAtiva === 'atividade' && (
                <AtividadeSection userStoryId={userStory.id} />
              )}

              {/* Comentários */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Comentários</h3>
                <div className="flex gap-3">
                  <Avatar nome={usuarioAtual?.nomeCompleto} size="sm" />
                  <div className="flex-1">
                    <Textarea
                      value={novoComentario}
                      onChange={(e) => setNovoComentario(e.target.value)}
                      placeholder="Escreva um comentário... Use @nome para mencionar alguém"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <Button variant="primary" size="sm" disabled={!novoComentario.trim()}>
                        Comentar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar direita */}
            <div className="w-80 p-6 bg-gray-50">
              {/* Status */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Status
                </label>
                <Select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value as StatusUserStory)}
                  className="w-full"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Atribuído */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Atribuído
                </label>
                <button className="w-full flex items-center gap-2 p-2 border rounded-lg hover:bg-white transition-colors">
                  {userStory.atribuidos.length > 0 ? (
                    <div className="flex -space-x-2">
                      {userStory.atribuidos.slice(0, 3).map((id) => (
                        <Avatar key={id} nome="U" size="sm" />
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">Não atribuído</span>
                  )}
                  <span className="text-primary-500 ml-auto text-sm">Atribuir</span>
                </button>
                <button className="text-xs text-primary-500 mt-1 hover:underline">
                  Atribuir a mim
                </button>
              </div>

              {/* Pontos */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Pontos
                </label>
                <div className="space-y-2 bg-white p-3 rounded-lg border">
                  {projeto?.categoriaPontos.map((cat) => {
                    const ponto = userStory.pontos.find((p) => p.categoria === cat.id);
                    return (
                      <div key={cat.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{cat.nome}</span>
                        <Input
                          type="number"
                          min="0"
                          placeholder="?"
                          value={ponto?.valor ?? ''}
                          onChange={(e) => {
                            const novosPontos = userStory.pontos.map((p) =>
                              p.categoria === cat.id
                                ? { ...p, valor: e.target.value ? parseInt(e.target.value) : null }
                                : p
                            );
                            const total = novosPontos.reduce((acc, p) => acc + (p.valor || 0), 0);
                            atualizarUserStory(userStory.id, { pontos: novosPontos, totalPontos: total });
                          }}
                          className="w-16 text-center text-sm"
                        />
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between pt-2 border-t mt-2">
                    <span className="text-sm font-semibold text-gray-700">Total</span>
                    <span className="text-lg font-bold text-primary-600">
                      {userStory.totalPontos || '?'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sprint */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Sprint
                </label>
                <Select
                  value={userStory.sprint || ''}
                  onChange={(e) => atualizarUserStory(userStory.id, { sprint: e.target.value || undefined })}
                >
                  <option value="">Backlog (sem sprint)</option>
                  {/* Adicionar sprints dinamicamente */}
                </Select>
              </div>

              {/* Observadores */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Observadores ({userStory.observadores.length})
                </label>
                <div className="flex flex-wrap gap-1">
                  {userStory.observadores.length > 0 ? (
                    userStory.observadores.map((id) => (
                      <Avatar key={id} nome="U" size="sm" />
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">Nenhum observador</span>
                  )}
                </div>
              </div>

              {/* Metadados */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Criado por <strong>{usuarioAtual?.nomeCompleto}</strong></p>
                <p>em {formatarDataHora(userStory.dataCriacao)}</p>
                <p className="pt-2">Modificado em {formatarDataHora(userStory.dataModificacao)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SEÇÃO DE TAREFAS
// ==========================================
interface TarefasSectionProps {
  userStoryId: string;
  sprintId?: string;
  projetoId: string;
  tarefas: Tarefa[];
}

function TarefasSection({ userStoryId, sprintId, projetoId, tarefas }: TarefasSectionProps) {
  const [novaTarefa, setNovaTarefa] = useState('');
  const { adicionarTarefa, atualizarTarefa, excluirTarefa, usuarioAtual } = useAppStore();

  const handleAdicionarTarefa = () => {
    if (novaTarefa.trim()) {
      adicionarTarefa({
        titulo: novaTarefa.trim(),
        descricao: '',
        projeto: projetoId,
        userStory: userStoryId,
        sprint: sprintId,
        status: 'novo',
        tags: [],
        anexos: [],
        atribuido: undefined,
        observadores: [],
        criadoPor: usuarioAtual?.id || '',
        ordem: tarefas.length + 1,
      });
      setNovaTarefa('');
    }
  };

  return (
    <div>
      {/* Nova tarefa */}
      <div className="flex gap-2 mb-4">
        <Input
          value={novaTarefa}
          onChange={(e) => setNovaTarefa(e.target.value)}
          placeholder="Adicionar nova tarefa..."
          onKeyDown={(e) => e.key === 'Enter' && handleAdicionarTarefa()}
        />
        <Button variant="primary" onClick={handleAdicionarTarefa} disabled={!novaTarefa.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Lista de tarefas */}
      <div className="space-y-2">
        {tarefas.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Nenhuma tarefa ainda</p>
        ) : (
          tarefas.map((tarefa) => (
            <div
              key={tarefa.id}
              className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
            >
              <input
                type="checkbox"
                checked={tarefa.status === 'fechado'}
                onChange={() =>
                  atualizarTarefa(tarefa.id, {
                    status: tarefa.status === 'fechado' ? 'novo' : 'fechado',
                  })
                }
                className="rounded border-gray-300 text-primary-500"
              />
              <span className="text-gray-500 text-sm">#{tarefa.ref}</span>
              <span
                className={cn(
                  'flex-1',
                  tarefa.status === 'fechado' && 'line-through text-gray-400'
                )}
              >
                {tarefa.titulo}
              </span>
              <Select
                value={tarefa.status}
                onChange={(e) => atualizarTarefa(tarefa.id, { status: e.target.value as any })}
                className="w-40 text-sm"
              >
                <option value="novo">Novo</option>
                <option value="emProgresso">Em Progresso</option>
                <option value="prontoParaTeste">Pronto p/ Teste</option>
                <option value="fechado">Fechado</option>
                <option value="precisaInfo">Precisa Info</option>
              </Select>
              <button
                onClick={() => excluirTarefa(tarefa.id)}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==========================================
// SEÇÃO DE ANEXOS
// ==========================================
interface AnexosSectionProps {
  anexos: Anexo[];
}

function AnexosSection({ anexos }: AnexosSectionProps) {
  return (
    <div>
      {/* Upload area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 hover:border-primary-400 transition-colors cursor-pointer">
        <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">Arraste arquivos aqui ou clique para fazer upload</p>
        <p className="text-xs text-gray-400 mt-1">Tamanho máximo: 10MB</p>
      </div>

      {/* Lista de anexos */}
      {anexos.length === 0 ? (
        <p className="text-gray-400 text-center py-4">Nenhum anexo</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {anexos.map((anexo) => (
            <div
              key={anexo.id}
              className="flex items-center gap-3 p-3 bg-white border rounded-lg"
            >
              <Paperclip className="w-5 h-5 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{anexo.nome}</p>
                <p className="text-xs text-gray-400">
                  {formatarTamanhoArquivo(anexo.tamanho)} • {formatarData(anexo.dataEnvio)}
                </p>
              </div>
              <button className="p-1 text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// SEÇÃO DE ATIVIDADE
// ==========================================
interface AtividadeSectionProps {
  userStoryId: string;
}

function AtividadeSection({ userStoryId }: AtividadeSectionProps) {
  // Mock de atividades
  const atividades = [
    { id: '1', texto: 'criou esta história de usuário', usuario: 'Demo', data: new Date() },
    { id: '2', texto: 'alterou o status para "Em Progresso"', usuario: 'Demo', data: new Date() },
  ];

  return (
    <div className="space-y-4">
      {atividades.map((ativ) => (
        <div key={ativ.id} className="flex gap-3">
          <Avatar nome={ativ.usuario} size="sm" />
          <div>
            <p className="text-sm">
              <strong className="text-gray-800">{ativ.usuario}</strong>{' '}
              <span className="text-gray-600">{ativ.texto}</span>
            </p>
            <p className="text-xs text-gray-400">{formatarDataHora(ativ.data)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
