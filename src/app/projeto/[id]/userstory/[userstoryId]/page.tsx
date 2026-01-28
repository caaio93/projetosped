'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronDown,
  Plus,
  Paperclip,
  Grid,
  List,
  X,
  Eye,
  Clock,
  MessageSquare,
  History,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { cn, formatarData, formatarDataHora, formatarTamanhoArquivo } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useHydration } from '@/lib/useHydration';
import { Button, Input, Avatar, Badge, Modal, MarkdownEditor } from '@/components/ui';
import type { Tarefa, StatusTarefa, Anexo, PontoUserStory } from '@/types';

const STATUS_OPTIONS = [
  { value: 'novo', label: 'Novo', cor: '#70728f' },
  { value: 'emProgresso', label: 'Em Progresso', cor: '#e44057' },
  { value: 'prontoParaTeste', label: 'Pronto para Teste', cor: '#ffc107' },
  { value: 'fechado', label: 'Fechado', cor: '#a8e6cf' },
  { value: 'precisaInfo', label: 'Precisa de Info', cor: '#ff9800' },
];

const PONTOS_CATEGORIAS = [
  { id: 'ux', label: 'UX' },
  { id: 'design', label: 'Design' },
  { id: 'front', label: 'Front' },
  { id: 'back', label: 'Back' },
];

export default function UserStoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hydrated = useHydration();
  const projetoId = params.id as string;
  const userStoryId = params.userstoryId as string;

  const [abaAtiva, setAbaAtiva] = useState<'comentarios' | 'atividades'>('comentarios');
  const [novoComentario, setNovoComentario] = useState('');
  const [novaTarefaTitulo, setNovaTarefaTitulo] = useState('');
  const [mostrarFormTarefa, setMostrarFormTarefa] = useState(false);
  const [viewAnexos, setViewAnexos] = useState<'grid' | 'list'>('list');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    getUserStoryById,
    atualizarUserStory,
    excluirUserStory,
    getTarefasPorUserStory,
    adicionarTarefa,
    atualizarTarefa,
    excluirTarefa,
    usuarioAtual,
    getProjetoAtual,
    getAtividadesPorProjeto,
  } = useAppStore();

  // Renderizar loading antes de acessar dados do store
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  const userStory = getUserStoryById(userStoryId);
  const projeto = getProjetoAtual();
  const tarefas = getTarefasPorUserStory(userStoryId);

  if (!userStory) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">User Story não encontrada</p>
      </div>
    );
  }

  const handleAdicionarTarefa = () => {
    if (novaTarefaTitulo.trim()) {
      adicionarTarefa({
        titulo: novaTarefaTitulo.trim(),
        descricao: '',
        status: 'novo',
        userStory: userStoryId,
        sprint: userStory.sprint,
        projeto: projetoId,
        ordem: tarefas.length,
        tags: [],
        anexos: [],
        observadores: [],
        criadoPor: usuarioAtual?.id || '',
      });
      setNovaTarefaTitulo('');
      setMostrarFormTarefa(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processarArquivos(Array.from(files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const files = e.dataTransfer.files;
    if (files) {
      processarArquivos(Array.from(files));
    }
  };

  const processarArquivos = (files: File[]) => {
    const novosAnexos: Anexo[] = files.map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      nome: file.name,
      url: URL.createObjectURL(file),
      tipo: file.type,
      tamanho: file.size,
      descricao: '',
      isDeprecado: false,
      enviadoPor: usuarioAtual?.id || '',
      dataEnvio: new Date(),
    }));

    const anexosAtualizados = [...(userStory.anexos || []), ...novosAnexos];
    atualizarUserStory(userStoryId, { anexos: anexosAtualizados });
  };

  const handleRemoverAnexo = (anexoId: string) => {
    const anexosAtualizados = (userStory.anexos || []).filter((a) => a.id !== anexoId);
    atualizarUserStory(userStoryId, { anexos: anexosAtualizados });
  };

  const handleAdicionarComentario = () => {
    // Comentários não estão implementados no tipo UserStory ainda
    setNovoComentario('');
  };

  const handleToggleObservador = () => {
    const observadores = userStory.observadores || [];
    const userId = usuarioAtual?.id || '';
    
    if (observadores.includes(userId)) {
      atualizarUserStory(userStoryId, { 
        observadores: observadores.filter(id => id !== userId) 
      });
    } else {
      atualizarUserStory(userStoryId, { 
        observadores: [...observadores, userId] 
      });
    }
  };

  const handleCopiarLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copiado para a área de transferência!');
    });
  };

  const handleExcluir = () => {
    excluirUserStory(userStoryId);
    router.push(`/projeto/${projetoId}/backlog`);
  };

  const isObservando = (userStory.observadores || []).includes(usuarioAtual?.id || '');
  const atividadesUserStory = getAtividadesPorProjeto(projetoId).filter(
    a => a.entidadeId === userStoryId || 
    (a.entidadeTipo === 'tarefa' && tarefas.some(t => t.id === a.entidadeId))
  );

  const statusAtual = STATUS_OPTIONS.find((s) => s.value === userStory.status);

  return (
    <div className="h-full flex flex-col bg-white" suppressHydrationWarning>
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-primary-500 font-mono text-lg" suppressHydrationWarning>#{userStory.ref}</span>
              <span className="text-xl font-semibold text-gray-900" suppressHydrationWarning>{userStory.titulo}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>USER STORY</span>
              <Link
                href={`/projeto/${projetoId}/sprint/${userStory.sprint}`}
                className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-medium hover:bg-primary-200"
              >
                TASKBOARD
              </Link>
            </div>
          </div>

          {/* Status dropdown */}
          <div className="flex items-center gap-2">
            <div
              className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2"
              style={{ backgroundColor: statusAtual?.cor || '#70728f' }}
            >
              {statusAtual?.label || 'Novo'}
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 mt-3">
          <button className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Add tag
          </button>
          {userStory.tags?.map((tag) => (
            <Badge key={tag.id} variant="solid">
              {tag.nome}
            </Badge>
          ))}
        </div>

        {/* Criado por */}
        <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
          <span>Created by</span>
          <span className="text-primary-500 font-medium" suppressHydrationWarning>{usuarioAtual?.nomeCompleto || 'Usuário'}</span>
          <span suppressHydrationWarning>{formatarDataHora(userStory.dataCriacao)}</span>
          <Avatar nome={usuarioAtual?.nomeCompleto || 'U'} size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Descrição */}
          <div className="mb-6">
            {userStory.descricao ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: userStory.descricao }}
              />
            ) : (
              <p className="text-gray-400 italic">Sem descrição</p>
            )}
          </div>

          {/* Anexos */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                {(userStory.anexos?.length || 0)} Attachments
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewAnexos('grid')}
                  className={cn(
                    'p-1 rounded',
                    viewAnexos === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'
                  )}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewAnexos('list')}
                  className={cn(
                    'p-1 rounded',
                    viewAnexos === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
            />

            {(userStory.anexos?.length || 0) > 0 ? (
              <div className={viewAnexos === 'grid' ? 'grid grid-cols-4 gap-3' : 'space-y-2'}>
                {userStory.anexos?.map((anexo) => (
                  <div
                    key={anexo.id}
                    className={cn(
                      'flex items-center gap-3 p-2 bg-gray-50 rounded-lg',
                      viewAnexos === 'grid' && 'flex-col text-center'
                    )}
                  >
                    <Paperclip className="w-5 h-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-primary-500 truncate">{anexo.nome}</p>
                      <p className="text-xs text-gray-500">{formatarTamanhoArquivo(anexo.tamanho)}</p>
                    </div>
                    <button
                      onClick={() => handleRemoverAnexo(anexo.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                className={cn(
                  'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
                  isDraggingFile ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
                )}
              >
                <p className="text-sm text-gray-500">Arraste arquivos ou clique para adicionar</p>
              </div>
            )}
          </div>

          {/* Tarefas */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Tasks</h3>
              <button
                onClick={() => setMostrarFormTarefa(true)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {mostrarFormTarefa && (
              <div className="flex items-center gap-2 mb-3">
                <Input
                  value={novaTarefaTitulo}
                  onChange={(e) => setNovaTarefaTitulo(e.target.value)}
                  placeholder="Título da tarefa..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdicionarTarefa()}
                />
                <Button variant="primary" size="sm" onClick={handleAdicionarTarefa}>
                  Adicionar
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setMostrarFormTarefa(false)}>
                  Cancelar
                </Button>
              </div>
            )}

            <div className="space-y-2">
              {tarefas.map((tarefa) => (
                <div
                  key={tarefa.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <span className="text-xs text-gray-500">#{tarefa.ref}</span>
                  <span className="flex-1 text-sm">{tarefa.titulo}</span>
                  <select
                    value={tarefa.status}
                    onChange={(e) => atualizarTarefa(tarefa.id, { status: e.target.value as StatusTarefa })}
                    className="text-xs px-2 py-1 border rounded"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {tarefa.atribuido ? (
                    <Avatar nome={usuarioAtual?.nomeCompleto || 'U'} size="sm" />
                  ) : (
                    <button
                      onClick={() => {
                        if (usuarioAtual) {
                          atualizarTarefa(tarefa.id, { atribuido: usuarioAtual.id });
                        }
                      }}
                      className="text-xs text-primary-500"
                    >
                      Atribuir
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tabs: Comentários / Atividades */}
          <div className="border-t pt-4">
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setAbaAtiva('comentarios')}
                className={cn(
                  'text-sm font-medium pb-2 border-b-2 transition-colors',
                  abaAtiva === 'comentarios'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                0 Comments
              </button>
              <button
                onClick={() => setAbaAtiva('atividades')}
                className={cn(
                  'text-sm font-medium pb-2 border-b-2 transition-colors',
                  abaAtiva === 'atividades'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                Activities
              </button>
            </div>

            {abaAtiva === 'comentarios' && (
              <div>
                <div className="mb-4">
                  <Input
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    placeholder="Type a new comment here"
                    onKeyDown={(e) => e.key === 'Enter' && handleAdicionarComentario()}
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-400 italic">Nenhum comentário ainda</p>
                </div>
              </div>
            )}

            {abaAtiva === 'atividades' && (
              <div className="text-sm text-gray-500">
                <div className="flex gap-3 items-start">
                  <Clock className="w-4 h-4 mt-0.5" />
                  <div>
                    <p>
                      <strong>{usuarioAtual?.nomeCompleto}</strong> criou esta User Story
                    </p>
                    <p className="text-xs text-gray-400">{formatarDataHora(userStory.dataCriacao)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-64 border-l p-4 bg-gray-50">
          {/* Pontos */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Points</h4>
            <div className="space-y-2">
              {PONTOS_CATEGORIAS.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{cat.label}</span>
                  <span className="text-sm font-medium">
                    {userStory.pontos?.find((p: PontoUserStory) => p.categoria === cat.id)?.valor ?? '?'}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium text-gray-700">total points</span>
                <span className="text-sm font-semibold">{userStory.totalPontos || '?'}</span>
              </div>
            </div>
          </div>

          {/* Atribuído */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Assigned</h4>
            {userStory.atribuidos?.length > 0 ? (
              <div className="flex items-center gap-2">
                <Avatar nome={usuarioAtual?.nomeCompleto || 'U'} size="sm" />
                <span className="text-sm">{usuarioAtual?.nomeCompleto}</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (usuarioAtual) {
                    atualizarUserStory(userStoryId, { atribuidos: [usuarioAtual.id] });
                  }
                }}
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                + Add assigned
              </button>
            )}
          </div>

          {/* Watchers */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Watchers</h4>
            <button className="text-sm text-primary-500 hover:text-primary-600">+ Add watchers</button>
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <button 
              className={cn(
                "p-2 rounded hover:bg-gray-200",
                isObservando && "bg-primary-100"
              )}
              title={isObservando ? "Parar de observar" : "Observar"}
              onClick={handleToggleObservador}
            >
              <Eye className={cn("w-4 h-4", isObservando ? "text-primary-500" : "text-gray-500")} />
            </button>
            <button 
              className="p-2 rounded hover:bg-gray-200" 
              title="Copiar link"
              onClick={handleCopiarLink}
            >
              <Paperclip className="w-4 h-4 text-gray-500" />
            </button>
            <button 
              className="p-2 rounded hover:bg-gray-200" 
              title="Histórico"
              onClick={() => setModalHistoricoAberto(true)}
            >
              <History className="w-4 h-4 text-gray-500" />
            </button>
            <button 
              className="p-2 rounded hover:bg-gray-200 hover:bg-red-50" 
              title="Excluir"
              onClick={() => setModalExcluirAberto(true)}
            >
              <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Histórico */}
      <Modal
        isOpen={modalHistoricoAberto}
        onClose={() => setModalHistoricoAberto(false)}
        title="Histórico de Atividades"
        size="lg"
      >
        <div className="max-h-96 overflow-auto">
          {atividadesUserStory.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhuma atividade registrada</p>
          ) : (
            <div className="space-y-3">
              {atividadesUserStory.map((atividade) => (
                <div key={atividade.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-primary-600">{atividade.usuarioNome}</span>
                      <span className="text-gray-600 text-sm" dangerouslySetInnerHTML={{ __html: atividade.descricao }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1" suppressHydrationWarning>
                      {formatarDataHora(atividade.dataCriacao)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal Confirmar Exclusão */}
      <Modal
        isOpen={modalExcluirAberto}
        onClose={() => setModalExcluirAberto(false)}
        title="Excluir User Story"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalExcluirAberto(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleExcluir}>
              Excluir
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Tem certeza que deseja excluir a User Story <strong>#{userStory.ref} {userStory.titulo}</strong>?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Esta ação não pode ser desfeita. Todas as tarefas associadas permanecerão no sistema.
        </p>
      </Modal>
    </div>
  );
}
