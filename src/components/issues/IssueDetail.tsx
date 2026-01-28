'use client';

import { useState, useRef } from 'react';
import {
  X,
  Plus,
  Paperclip,
  Eye,
  EyeOff,
  Clock,
  Lock,
  Unlock,
  MessageSquare,
  History,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { cn, formatarData, formatarDataHora, formatarTamanhoArquivo } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Button, Input, Textarea, Select, Avatar, Badge, Modal, StatusDot, MarkdownEditor } from '@/components/ui';
import type { Issue, TipoIssue, Severidade, Prioridade, StatusIssue, Anexo } from '@/types';

const TIPO_CONFIG: Record<TipoIssue, { label: string; cor: string }> = {
  bug: { label: 'Bug', cor: '#f44336' },
  melhoria: { label: 'Melhoria', cor: '#2196f3' },
  pergunta: { label: 'Pergunta', cor: '#9c27b0' },
  suporte: { label: 'Suporte', cor: '#607d8b' },
};

const SEVERIDADE_CONFIG: Record<Severidade, { label: string; cor: string }> = {
  wishlist: { label: 'Desejável', cor: '#9e9e9e' },
  minor: { label: 'Menor', cor: '#4caf50' },
  normal: { label: 'Normal', cor: '#4caf50' },
  important: { label: 'Importante', cor: '#ffc107' },
  critical: { label: 'Crítico', cor: '#f44336' },
};

const PRIORIDADE_CONFIG: Record<Prioridade, { label: string; cor: string }> = {
  baixa: { label: 'Baixa', cor: '#4caf50' },
  normal: { label: 'Normal', cor: '#ffc107' },
  alta: { label: 'Alta', cor: '#f44336' },
};

const STATUS_CONFIG: Record<StatusIssue, { label: string; cor: string }> = {
  novo: { label: 'Novo', cor: '#70728f' },
  emProgresso: { label: 'Em Progresso', cor: '#e44057' },
  prontoParaTeste: { label: 'Pronto para Teste', cor: '#ffc107' },
  fechado: { label: 'Fechado', cor: '#a8e6cf' },
  precisaInfo: { label: 'Precisa de Informação', cor: '#ff9800' },
  rejeitado: { label: 'Rejeitado', cor: '#9e9e9e' },
};

interface IssueDetailProps {
  issue: Issue;
  onClose: () => void;
}

export function IssueDetail({ issue, onClose }: IssueDetailProps) {
  const [abaAtiva, setAbaAtiva] = useState<'descricao' | 'anexos' | 'atividade'>('descricao');
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [editandoDescricao, setEditandoDescricao] = useState(false);
  const [titulo, setTitulo] = useState(issue.titulo);
  const [descricao, setDescricao] = useState(issue.descricao);
  const [novoComentario, setNovoComentario] = useState('');
  const [novaTag, setNovaTag] = useState('');
  const [mostrarFormTag, setMostrarFormTag] = useState(false);
  const [isObservando, setIsObservando] = useState(false);
  const [isBloqueado, setIsBloqueado] = useState(false);
  const [votos, setVotos] = useState({ positivos: 5, negativos: 1 });
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [dropdownAtribuirAberto, setDropdownAtribuirAberto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { atualizarIssue, excluirIssue, usuarioAtual } = useAppStore();

  // Handlers
  const handleSalvarTitulo = () => {
    atualizarIssue(issue.id, { titulo });
    setEditandoTitulo(false);
  };

  const handleSalvarDescricao = () => {
    atualizarIssue(issue.id, { descricao });
    setEditandoDescricao(false);
  };

  const handleAdicionarTag = () => {
    if (novaTag.trim()) {
      const novaTags = [
        ...issue.tags,
        { id: Date.now().toString(), nome: novaTag.trim(), cor: '#' + Math.floor(Math.random() * 16777215).toString(16) },
      ];
      atualizarIssue(issue.id, { tags: novaTags });
      setNovaTag('');
      setMostrarFormTag(false);
    }
  };

  const handleCopiarLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copiado para a área de transferência!');
    }).catch(() => {
      alert('Não foi possível copiar o link.');
    });
  };

  const handleExcluirIssue = () => {
    if (confirm(`Tem certeza que deseja excluir a issue "${issue.titulo}"?`)) {
      excluirIssue(issue.id);
      onClose();
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
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
    
    const anexosAtualizados = [...(issue.anexos || []), ...novosAnexos];
    atualizarIssue(issue.id, { anexos: anexosAtualizados });
  };

  const handleRemoverAnexo = (anexoId: string) => {
    const anexosAtualizados = issue.anexos.filter((a) => a.id !== anexoId);
    atualizarIssue(issue.id, { anexos: anexosAtualizados });
  };

  const handleAdicionarComentario = () => {
    if (novoComentario.trim()) {
      const novoComentarioObj = {
        id: Date.now().toString(),
        conteudo: novoComentario.trim(),
        autor: usuarioAtual?.id || '',
        dataCriacao: new Date(),
        isEditado: false,
      };
      const comentariosAtualizados = [...(issue.comentarios || []), novoComentarioObj];
      atualizarIssue(issue.id, { comentarios: comentariosAtualizados });
      setNovoComentario('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative ml-auto w-full max-w-4xl bg-white shadow-xl flex flex-col h-full animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <StatusDot color={TIPO_CONFIG[issue.tipo].cor} size="lg" />
            <span className="text-gray-500 font-mono">#{issue.ref}</span>
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
            {/* Votos */}
            <div className="flex items-center gap-1 mr-2">
              <button
                className="flex items-center gap-1 px-2 py-1 text-sm text-green-600 hover:bg-green-50 rounded"
                onClick={() => setVotos({ ...votos, positivos: votos.positivos + 1 })}
              >
                <ThumbsUp className="w-4 h-4" />
                {votos.positivos}
              </button>
              <button
                className="flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                onClick={() => setVotos({ ...votos, negativos: votos.negativos + 1 })}
              >
                <ThumbsDown className="w-4 h-4" />
                {votos.negativos}
              </button>
            </div>
            <button
              onClick={() => setIsObservando(!isObservando)}
              className={cn(
                'p-2 rounded-full transition-colors',
                isObservando ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:bg-gray-100'
              )}
            >
              {isObservando ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsBloqueado(!isBloqueado)}
              className={cn(
                'p-2 rounded-full transition-colors',
                isBloqueado ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:bg-gray-100'
              )}
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

        {/* Conteúdo */}
        <div className="flex-1 overflow-auto">
          <div className="flex">
            {/* Coluna principal */}
            <div className="flex-1 p-6 border-r">
              {/* Tags */}
              <div className="mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {issue.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm"
                      style={{ backgroundColor: tag.cor + '20', color: tag.cor }}
                    >
                      {tag.nome}
                      <button className="hover:bg-black/10 rounded-full p-0.5">
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
                  { id: 'anexos', label: `Anexos (${issue.anexos.length})`, icon: Paperclip },
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
                      <MarkdownEditor
                        value={descricao}
                        onChange={setDescricao}
                        rows={10}
                        placeholder="Descreva o problema em detalhes..."
                        showHelp={false}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">Editor de texto</span>
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
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: descricao }}
                        />
                      ) : (
                        <p className="text-gray-400 italic">Clique para adicionar uma descrição...</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {abaAtiva === 'anexos' && (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors cursor-pointer",
                      isDraggingFile 
                        ? "border-primary-500 bg-primary-50" 
                        : "border-gray-300 hover:border-primary-400"
                    )}
                  >
                    <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      {isDraggingFile ? 'Solte os arquivos aqui' : 'Arraste arquivos aqui ou clique para fazer upload'}
                    </p>
                  </div>
                  
                  {/* Lista de anexos */}
                  {issue.anexos.length > 0 ? (
                    <div className="space-y-2">
                      {issue.anexos.map((anexo) => (
                        <div key={anexo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Paperclip className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">{anexo.nome}</p>
                              <p className="text-xs text-gray-500">{formatarTamanhoArquivo(anexo.tamanho)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoverAnexo(anexo.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">Nenhum anexo</p>
                  )}
                </div>
              )}

              {abaAtiva === 'atividade' && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Avatar nome="Demo" size="sm" />
                    <div>
                      <p className="text-sm">
                        <strong className="text-gray-800">Demo</strong>{' '}
                        <span className="text-gray-600">criou esta issue</span>
                      </p>
                      <p className="text-xs text-gray-400">{formatarDataHora(issue.dataCriacao)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Comentários */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Comentários</h3>
                
                {/* Lista de comentários existentes */}
                {issue.comentarios && issue.comentarios.length > 0 && (
                  <div className="space-y-4 mb-6">
                    {issue.comentarios.map((comentario) => (
                      <div key={comentario.id} className="flex gap-3">
                        <Avatar nome={comentario.autor === usuarioAtual?.id ? usuarioAtual?.nomeCompleto : 'Usuário'} size="sm" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-800">
                              {comentario.autor === usuarioAtual?.id ? usuarioAtual?.nomeCompleto : 'Usuário'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatarDataHora(comentario.dataCriacao)}
                            </span>
                          </div>
                          <div 
                            className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-3"
                            dangerouslySetInnerHTML={{ __html: comentario.conteudo }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulário de novo comentário */}
                <div className="flex gap-3">
                  <Avatar nome={usuarioAtual?.nomeCompleto} size="sm" />
                  <div className="flex-1">
                    <Textarea
                      value={novoComentario}
                      onChange={(e) => setNovoComentario(e.target.value)}
                      placeholder="Escreva um comentário..."
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <Button variant="primary" size="sm" disabled={!novoComentario.trim()} onClick={handleAdicionarComentario}>
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
                  value={issue.status}
                  onChange={(e) => atualizarIssue(issue.id, { status: e.target.value as StatusIssue })}
                >
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Atribuído */}
              <div className="mb-6 relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Atribuído
                </label>
                {issue.atribuido ? (
                  <div className="flex items-center gap-2 p-2 border rounded-lg bg-white">
                    <Avatar nome={usuarioAtual?.nomeCompleto || 'Usuário'} size="sm" />
                    <span className="text-sm text-gray-700 flex-1">{usuarioAtual?.nomeCompleto || 'Usuário'}</span>
                    <button 
                      onClick={() => atualizarIssue(issue.id, { atribuido: undefined })}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <button 
                        className="w-full flex items-center gap-2 p-2 border rounded-lg hover:bg-white transition-colors"
                        onClick={() => setDropdownAtribuirAberto(!dropdownAtribuirAberto)}
                      >
                        <span className="text-gray-400">Não atribuído</span>
                        <span className="text-primary-500 ml-auto text-sm">Atribuir</span>
                      </button>
                      
                      {/* Dropdown de usuários */}
                      {dropdownAtribuirAberto && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
                          <div className="p-2 border-b">
                            <input 
                              type="text" 
                              placeholder="Buscar usuário..." 
                              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            <p className="text-xs text-gray-400 p-3 text-center">
                              Usuários serão listados aqui futuramente
                            </p>
                          </div>
                          <div className="p-2 border-t">
                            <button 
                              onClick={() => setDropdownAtribuirAberto(false)}
                              className="w-full text-xs text-gray-500 hover:text-gray-700"
                            >
                              Fechar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <button 
                      className="text-xs text-primary-500 mt-1 hover:underline"
                      onClick={() => {
                        if (usuarioAtual) {
                          atualizarIssue(issue.id, { atribuido: usuarioAtual.id });
                        }
                      }}
                    >
                      Atribuir a mim
                    </button>
                  </>
                )}
              </div>

              {/* Tipo */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Tipo
                </label>
                <div className="flex items-center gap-2">
                  <Select
                    value={issue.tipo}
                    onChange={(e) => atualizarIssue(issue.id, { tipo: e.target.value as TipoIssue })}
                    className="flex-1"
                  >
                    {Object.entries(TIPO_CONFIG).map(([value, config]) => (
                      <option key={value} value={value}>
                        {config.label}
                      </option>
                    ))}
                  </Select>
                  <StatusDot color={TIPO_CONFIG[issue.tipo].cor} size="lg" />
                </div>
              </div>

              {/* Severidade */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Severidade
                </label>
                <div className="flex items-center gap-2">
                  <Select
                    value={issue.severidade}
                    onChange={(e) => atualizarIssue(issue.id, { severidade: e.target.value as Severidade })}
                    className="flex-1"
                  >
                    {Object.entries(SEVERIDADE_CONFIG).map(([value, config]) => (
                      <option key={value} value={value}>
                        {config.label}
                      </option>
                    ))}
                  </Select>
                  <StatusDot color={SEVERIDADE_CONFIG[issue.severidade].cor} size="lg" />
                </div>
              </div>

              {/* Prioridade */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Prioridade
                </label>
                <div className="flex items-center gap-2">
                  <Select
                    value={issue.prioridade}
                    onChange={(e) => atualizarIssue(issue.id, { prioridade: e.target.value as Prioridade })}
                    className="flex-1"
                  >
                    {Object.entries(PRIORIDADE_CONFIG).map(([value, config]) => (
                      <option key={value} value={value}>
                        {config.label}
                      </option>
                    ))}
                  </Select>
                  <StatusDot color={PRIORIDADE_CONFIG[issue.prioridade].cor} size="lg" />
                </div>
              </div>

              {/* Observadores */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Observadores ({issue.observadores.length})
                </label>
                <div className="flex flex-wrap gap-1">
                  {issue.observadores.length > 0 ? (
                    issue.observadores.map((id) => <Avatar key={id} nome="U" size="sm" />)
                  ) : (
                    <span className="text-sm text-gray-400">Nenhum observador</span>
                  )}
                </div>
              </div>

              {/* Metadados */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  Criado por <strong>{usuarioAtual?.nomeCompleto}</strong>
                </p>
                <p>em {formatarDataHora(issue.dataCriacao)}</p>
                <p className="pt-2">Modificado em {formatarDataHora(issue.dataModificacao)}</p>
              </div>

              {/* Ações */}
              <div className="flex gap-2 mt-6 pt-6 border-t">
                <Button variant="ghost" size="sm" className="flex-1" onClick={handleCopiarLink}>
                  <ExternalLink className="w-4 h-4" />
                  Link
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 flex-1" onClick={handleExcluirIssue}>
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
