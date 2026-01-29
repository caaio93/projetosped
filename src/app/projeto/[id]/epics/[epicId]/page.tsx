'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useHydration } from '@/lib/useHydration';
import { Button, Modal, Input } from '@/components/ui';
import { 
  ChevronDown, 
  Plus, 
  Paperclip, 
  X, 
  Eye, 
  EyeOff,
  UserPlus,
  Trash2,
  FileText,
  Grid,
  List,
  Link as LinkIcon,
  Bold,
  Italic,
  Underline,
  ListOrdered,
  ListIcon,
  Quote,
  Code,
} from 'lucide-react';
import { cn, formatarDataHora, formatarTamanhoArquivo } from '@/lib/utils';
import type { StatusEpic, Anexo } from '@/types';
import { STATUS_EPIC_CONFIG } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const CORES_EPIC = [
  '#8BC34A', '#4CAF50', '#009688', '#00BCD4', '#03A9F4',
  '#2196F3', '#3F51B5', '#673AB7', '#9C27B0', '#E91E63',
  '#F44336', '#FF5722', '#FF9800', '#FFC107', '#FFEB3B',
];

export default function EpicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hydrated = useHydration();
  const projetoId = params.id as string;
  const epicId = params.epicId as string;

  const [novoComentario, setNovoComentario] = useState('');
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [modalVincularUSAberto, setModalVincularUSAberto] = useState(false);
  const [modalNovaUSAberto, setModalNovaUSAberto] = useState(false);
  const [novaUSTitulo, setNovaUSTitulo] = useState('');
  const [filtroUS, setFiltroUS] = useState('');
  const [viewAnexos, setViewAnexos] = useState<'grid' | 'list'>('list');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [statusDropdownAberto, setStatusDropdownAberto] = useState(false);
  const [corPickerAberto, setCorPickerAberto] = useState(false);
  const [assignedDropdownAberto, setAssignedDropdownAberto] = useState(false);
  const [watchersDropdownAberto, setWatchersDropdownAberto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    getEpicById,
    atualizarEpic,
    excluirEpic,
    adicionarComentarioEpic,
    vincularUserStoryAoEpic,
    desvincularUserStoryDoEpic,
    getUserStoryById,
    getUserStoriesPorProjeto,
    adicionarUserStory,
    usuarioAtual,
    getUsuarios,
  } = useAppStore();

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

  const epic = getEpicById(epicId);

  if (!epic) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Epic não encontrado</p>
      </div>
    );
  }

  const userStoriesVinculadas = epic.userStories
    .map((usId) => getUserStoryById(usId))
    .filter(Boolean);

  const userStoriesDisponiveis = getUserStoriesPorProjeto(projetoId)
    .filter((us) => !epic.userStories.includes(us.id))
    .filter((us) => 
      filtroUS === '' || 
      us.titulo.toLowerCase().includes(filtroUS.toLowerCase()) ||
      us.ref.toString().includes(filtroUS)
    );

  const handleAdicionarComentario = () => {
    if (novoComentario.trim()) {
      adicionarComentarioEpic(epicId, novoComentario.trim());
      setNovoComentario('');
    }
  };

  const handleAtualizarStatus = (novoStatus: StatusEpic) => {
    atualizarEpic(epicId, { status: novoStatus });
    setStatusDropdownAberto(false);
  };

  const handleAtualizarCor = (novaCor: string) => {
    atualizarEpic(epicId, { cor: novaCor });
    setCorPickerAberto(false);
  };

  const handleExcluir = () => {
    excluirEpic(epicId);
    router.push(`/projeto/${projetoId}/epics`);
  };

  const handleToggleObservador = () => {
    const observadores = epic.observadores || [];
    const userId = usuarioAtual?.id || '';
    
    if (observadores.includes(userId)) {
      atualizarEpic(epicId, { 
        observadores: observadores.filter(id => id !== userId) 
      });
    } else {
      atualizarEpic(epicId, { 
        observadores: [...observadores, userId] 
      });
    }
  };

  const handleAtribuirAMim = () => {
    const atribuidos = epic.atribuidos || [];
    const userId = usuarioAtual?.id || '';
    
    if (!atribuidos.includes(userId)) {
      atualizarEpic(epicId, { 
        atribuidos: [...atribuidos, userId] 
      });
    }
  };

  const handleAdicionarAtribuido = (userId: string) => {
    const atribuidos = epic.atribuidos || [];
    if (!atribuidos.includes(userId)) {
      atualizarEpic(epicId, { 
        atribuidos: [...atribuidos, userId] 
      });
    }
    setAssignedDropdownAberto(false);
  };

  const handleRemoverAtribuido = (userId: string) => {
    const atribuidos = epic.atribuidos || [];
    atualizarEpic(epicId, { 
      atribuidos: atribuidos.filter(id => id !== userId) 
    });
  };

  const handleAdicionarObservador = (userId: string) => {
    const observadores = epic.observadores || [];
    if (!observadores.includes(userId)) {
      atualizarEpic(epicId, { 
        observadores: [...observadores, userId] 
      });
    }
    setWatchersDropdownAberto(false);
  };

  const handleRemoverObservador = (userId: string) => {
    const observadores = epic.observadores || [];
    atualizarEpic(epicId, { 
      observadores: observadores.filter(id => id !== userId) 
    });
  };

  const handleVincularUS = (userStoryId: string) => {
    vincularUserStoryAoEpic(epicId, userStoryId);
  };

  const handleDesvincularUS = (userStoryId: string) => {
    desvincularUserStoryDoEpic(epicId, userStoryId);
  };

  const handleCriarNovaUS = () => {
    if (novaUSTitulo.trim()) {
      const novaUSId = adicionarUserStory({
        titulo: novaUSTitulo.trim(),
        descricao: '',
        projeto: projetoId,
        status: 'novo',
        pontos: [],
        totalPontos: 0,
        tarefas: [],
        tags: [],
        anexos: [],
        atribuidos: [],
        observadores: [],
        criadoPor: usuarioAtual?.id || '',
        ordem: 0,
        ordemKanban: 0,
      });
      vincularUserStoryAoEpic(epicId, novaUSId);
      setNovaUSTitulo('');
      setModalNovaUSAberto(false);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const novosAnexos: Anexo[] = Array.from(files).map((file) => ({
      id: uuidv4(),
      nome: file.name,
      url: URL.createObjectURL(file),
      tipo: file.type,
      tamanho: file.size,
      enviadoPor: usuarioAtual?.id || '',
      dataEnvio: new Date(),
      isDeprecado: false,
    }));

    const anexosAtualizados = [...(epic.anexos || []), ...novosAnexos];
    atualizarEpic(epicId, { anexos: anexosAtualizados });
  };

  const handleRemoverAnexo = (anexoId: string) => {
    const anexosAtualizados = (epic.anexos || []).filter((a) => a.id !== anexoId);
    atualizarEpic(epicId, { anexos: anexosAtualizados });
  };

  const isObservando = (epic.observadores || []).includes(usuarioAtual?.id || '');
  const statusConfig = STATUS_EPIC_CONFIG[epic.status];

  return (
    <div className="h-full flex bg-white">
      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-primary-500 font-mono text-2xl">#{epic.ref}</span>
              <input
                type="text"
                value={epic.titulo}
                onChange={(e) => atualizarEpic(epicId, { titulo: e.target.value })}
                className="text-2xl font-semibold text-gray-900 bg-transparent border-none outline-none flex-1"
              />
            </div>
            <p className="text-sm text-gray-500 uppercase">EPIC</p>
          </div>

          {/* Cor do Epic */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-gray-600">Epic color:</span>
            <div className="relative">
              <button
                className="w-8 h-8 rounded border-2 border-gray-300"
                style={{ backgroundColor: epic.cor }}
                onClick={() => setCorPickerAberto(!corPickerAberto)}
              />
              {corPickerAberto && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setCorPickerAberto(false)} />
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border p-3 z-20">
                    <div className="flex flex-wrap gap-2 w-40">
                      {CORES_EPIC.map((cor) => (
                        <button
                          key={cor}
                          className={cn(
                            'w-6 h-6 rounded-full border-2 transition-all',
                            epic.cor === cor ? 'border-gray-800 scale-110' : 'border-transparent'
                          )}
                          style={{ backgroundColor: cor }}
                          onClick={() => handleAtualizarCor(cor)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tags e Criado por */}
          <div className="flex items-center justify-between mb-6">
            <button className="text-sm text-primary-500 hover:text-primary-600">
              Add tag +
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Created by <strong className="text-gray-700">{usuarioAtual?.nomeCompleto || 'Usuário'}</strong></span>
              <span suppressHydrationWarning>{formatarDataHora(epic.dataCriacao)}</span>
            </div>
          </div>

          {/* Descrição */}
          <div className="mb-8">
            <textarea
              value={epic.descricao}
              onChange={(e) => atualizarEpic(epicId, { descricao: e.target.value })}
              placeholder="Adicione uma descrição..."
              className="w-full min-h-[100px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Anexos */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                {epic.anexos?.length || 0} Attachments
              </h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 text-gray-500 hover:text-primary-500"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                isDraggingFile ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingFile(false);
                handleFileUpload(e.dataTransfer.files);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <p className="text-primary-500">Drop attachments here!</p>
            </div>

            {epic.anexos && epic.anexos.length > 0 && (
              <div className="mt-4 space-y-2">
                {epic.anexos.map((anexo) => (
                  <div
                    key={anexo.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{anexo.nome}</span>
                      <span className="text-xs text-gray-400">
                        {formatarTamanhoArquivo(anexo.tamanho)}
                      </span>
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
            )}
          </div>

          {/* User Stories Relacionadas */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Related user stories</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setModalVincularUSAberto(true)}
                  className="p-1 text-gray-500 hover:text-primary-500"
                  title="Vincular User Story existente"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {userStoriesVinculadas.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed rounded-lg">
                <p className="text-gray-500 mb-2">Nenhuma User Story vinculada</p>
                <div className="flex justify-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setModalVincularUSAberto(true)}>
                    <LinkIcon className="w-4 h-4 mr-1" />
                    Vincular existente
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setModalNovaUSAberto(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Criar nova
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {userStoriesVinculadas.map((us) => us && (
                  <div
                    key={us.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => router.push(`/projeto/${projetoId}/userstory/${us.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-primary-500 font-mono">#{us.ref}</span>
                      <span className="text-sm text-gray-700">{us.titulo}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDesvincularUS(us.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Desvincular"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 mt-3">
                  <Button variant="secondary" size="sm" onClick={() => setModalVincularUSAberto(true)}>
                    <LinkIcon className="w-4 h-4 mr-1" />
                    Vincular mais
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setModalNovaUSAberto(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Criar nova
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Comentários */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {epic.comentarios?.length || 0} Comments
            </h3>

            {/* Editor de Comentário */}
            <div className="border rounded-lg mb-4">
              <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
                <button className="p-1 hover:bg-gray-200 rounded" title="Negrito">
                  <Bold className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-200 rounded" title="Itálico">
                  <Italic className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-200 rounded" title="Sublinhado">
                  <Underline className="w-4 h-4 text-gray-500" />
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1" />
                <button className="p-1 hover:bg-gray-200 rounded" title="Lista ordenada">
                  <ListOrdered className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-200 rounded" title="Lista">
                  <ListIcon className="w-4 h-4 text-gray-500" />
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1" />
                <button className="p-1 hover:bg-gray-200 rounded" title="Citação">
                  <Quote className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-200 rounded" title="Código">
                  <Code className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <textarea
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                placeholder="Type a new comment here"
                className="w-full min-h-[80px] p-3 resize-none focus:outline-none"
              />
              {novoComentario.trim() && (
                <div className="flex justify-end p-2 border-t">
                  <Button size="sm" onClick={handleAdicionarComentario}>
                    Enviar
                  </Button>
                </div>
              )}
            </div>

            {/* Lista de Comentários */}
            {epic.comentarios && epic.comentarios.length > 0 && (
              <div className="space-y-4">
                {epic.comentarios.map((comentario) => (
                  <div key={comentario.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-primary-600">
                        {comentario.autorNome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{comentario.autorNome}</span>
                        <span className="text-xs text-gray-400" suppressHydrationWarning>
                          {formatarDataHora(comentario.dataCriacao)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comentario.conteudo}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Direita */}
      <div className="w-72 border-l bg-gray-50 p-4 overflow-auto">
        {/* Status */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-700">OPEN</span>
            <div className="relative">
              <button
                className="px-2 py-1 text-xs font-medium rounded flex items-center gap-1"
                style={{ backgroundColor: statusConfig.cor, color: epic.status === 'novo' ? '#fff' : '#000' }}
                onClick={() => setStatusDropdownAberto(!statusDropdownAberto)}
              >
                {statusConfig.label}
                <ChevronDown className="w-3 h-3" />
              </button>

              {statusDropdownAberto && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownAberto(false)} />
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border py-1 z-20 min-w-[140px]">
                    {(Object.keys(STATUS_EPIC_CONFIG) as StatusEpic[]).map((s) => (
                      <button
                        key={s}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => handleAtualizarStatus(s)}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: STATUS_EPIC_CONFIG[s].cor }}
                        />
                        {STATUS_EPIC_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Assigned */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Assigned</h4>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <button 
                className="w-full px-3 py-2 text-sm border rounded hover:bg-gray-100 flex items-center justify-center gap-1"
                onClick={() => setAssignedDropdownAberto(!assignedDropdownAberto)}
              >
                <UserPlus className="w-4 h-4" />
                Add assigned
              </button>
              {assignedDropdownAberto && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setAssignedDropdownAberto(false)} />
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border py-1 z-20 w-full min-w-[180px]">
                    {getUsuarios()
                      .filter(u => !(epic.atribuidos || []).includes(u.id))
                      .map((usuario) => (
                        <button
                          key={usuario.id}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          onClick={() => handleAdicionarAtribuido(usuario.id)}
                        >
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-600">
                            {usuario.nomeCompleto.charAt(0).toUpperCase()}
                          </div>
                          {usuario.nomeCompleto}
                        </button>
                      ))}
                    {getUsuarios().filter(u => !(epic.atribuidos || []).includes(u.id)).length === 0 && (
                      <p className="px-3 py-2 text-sm text-gray-500">Todos os usuários já foram atribuídos</p>
                    )}
                  </div>
                </>
              )}
            </div>
            <button 
              className="flex-1 px-3 py-2 text-sm border rounded hover:bg-gray-100"
              onClick={handleAtribuirAMim}
            >
              Assign to me
            </button>
          </div>
          {epic.atribuidos && epic.atribuidos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {epic.atribuidos.map((userId) => {
                const usuario = getUsuarios().find(u => u.id === userId);
                return (
                  <span 
                    key={userId} 
                    className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded flex items-center gap-1 group"
                  >
                    {usuario?.nomeCompleto || userId}
                    <button
                      onClick={() => handleRemoverAtribuido(userId)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Watchers */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Watchers</h4>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <button 
                className="w-full px-3 py-2 text-sm border rounded hover:bg-gray-100 flex items-center justify-center gap-1"
                onClick={() => setWatchersDropdownAberto(!watchersDropdownAberto)}
              >
                <UserPlus className="w-4 h-4" />
                Add watchers
              </button>
              {watchersDropdownAberto && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setWatchersDropdownAberto(false)} />
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border py-1 z-20 w-full min-w-[180px]">
                    {getUsuarios()
                      .filter(u => !(epic.observadores || []).includes(u.id))
                      .map((usuario) => (
                        <button
                          key={usuario.id}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          onClick={() => handleAdicionarObservador(usuario.id)}
                        >
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-600">
                            {usuario.nomeCompleto.charAt(0).toUpperCase()}
                          </div>
                          {usuario.nomeCompleto}
                        </button>
                      ))}
                    {getUsuarios().filter(u => !(epic.observadores || []).includes(u.id)).length === 0 && (
                      <p className="px-3 py-2 text-sm text-gray-500">Todos os usuários já são observadores</p>
                    )}
                  </div>
                </>
              )}
            </div>
            <button 
              className={cn(
                "flex-1 px-3 py-2 text-sm border rounded hover:bg-gray-100 flex items-center justify-center gap-1",
                isObservando && "bg-primary-100 border-primary-300"
              )}
              onClick={handleToggleObservador}
            >
              {isObservando ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isObservando ? 'Unwatch' : 'Watch'}
            </button>
          </div>
          {epic.observadores && epic.observadores.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {epic.observadores.map((userId) => {
                const usuario = getUsuarios().find(u => u.id === userId);
                return (
                  <span 
                    key={userId} 
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded flex items-center gap-1 group"
                  >
                    {usuario?.nomeCompleto || userId}
                    <button
                      onClick={() => handleRemoverObservador(userId)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-4 border-t">
          <button 
            className="p-2 rounded hover:bg-gray-200" 
            title="Copiar link"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copiado!');
            }}
          >
            <LinkIcon className="w-4 h-4 text-gray-500" />
          </button>
          <button 
            className="p-2 rounded hover:bg-red-50" 
            title="Excluir"
            onClick={() => setModalExcluirAberto(true)}
          >
            <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* Modal Vincular User Story */}
      <Modal
        isOpen={modalVincularUSAberto}
        onClose={() => setModalVincularUSAberto(false)}
        title="Vincular User Story"
        size="md"
      >
        <div className="space-y-4">
          <Input
            value={filtroUS}
            onChange={(e) => setFiltroUS(e.target.value)}
            placeholder="Buscar User Story..."
          />
          
          <div className="max-h-64 overflow-auto space-y-2">
            {userStoriesDisponiveis.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                Nenhuma User Story disponível
              </p>
            ) : (
              userStoriesDisponiveis.map((us) => (
                <div
                  key={us.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    handleVincularUS(us.id);
                    setModalVincularUSAberto(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-primary-500 font-mono">#{us.ref}</span>
                    <span className="text-sm text-gray-700">{us.titulo}</span>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Modal Nova User Story */}
      <Modal
        isOpen={modalNovaUSAberto}
        onClose={() => setModalNovaUSAberto(false)}
        title="Nova User Story"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalNovaUSAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarNovaUS} disabled={!novaUSTitulo.trim()}>
              Criar e Vincular
            </Button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título da User Story
          </label>
          <Input
            value={novaUSTitulo}
            onChange={(e) => setNovaUSTitulo(e.target.value)}
            placeholder="Digite o título..."
            autoFocus
          />
        </div>
      </Modal>

      {/* Modal Confirmar Exclusão */}
      <Modal
        isOpen={modalExcluirAberto}
        onClose={() => setModalExcluirAberto(false)}
        title="Excluir Epic"
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
          Tem certeza que deseja excluir o Epic <strong>#{epic.ref} {epic.titulo}</strong>?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Esta ação não pode ser desfeita. As User Stories vinculadas permanecerão no sistema.
        </p>
      </Modal>
    </div>
  );
}
