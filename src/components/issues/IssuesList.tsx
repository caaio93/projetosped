'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Filter, Search, MoreVertical, Upload, X } from 'lucide-react';
import { cn, formatarData } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Button, Input, Badge, Modal, Textarea, Select, StatusDot, EmptyState } from '@/components/ui';
import type { Issue, TipoIssue, Severidade, Prioridade, StatusIssue, Anexo } from '@/types';

interface IssuesListProps {
  projetoId: string;
}

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
  precisaInfo: { label: 'Precisa Info', cor: '#ff9800' },
  rejeitado: { label: 'Rejeitado', cor: '#9e9e9e' },
};

export function IssuesList({ projetoId }: IssuesListProps) {
  const router = useRouter();
  const [filtroTexto, setFiltroTexto] = useState('');
  const [mostrarTags, setMostrarTags] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  const { getIssuesPorProjeto, adicionarIssue, atualizarIssue, usuarioAtual } = useAppStore();
  const issues = getIssuesPorProjeto(projetoId);

  // Filtrar issues
  const issuesFiltradas = issues.filter(
    (issue) =>
      issue.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      issue.ref.toString().includes(filtroTexto)
  );

  const handleNovaIssue = () => {
    setModalAberto(true);
  };

  const handleVerIssue = (issue: Issue) => {
    router.push(`/projeto/${projetoId}/issues/${issue.id}`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-primary-500">Issues</h1>
          <Button variant="primary" onClick={handleNovaIssue}>
            <Plus className="w-4 h-4" />
            NOVA ISSUE
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-primary-500 text-sm font-medium">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="assunto ou referência"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="pl-10"
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
      </div>

      {/* Lista de Issues */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white">
          {/* Header da tabela */}
          <div className="flex items-center px-6 py-3 border-b bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <div className="w-16 text-center">Tipo</div>
            <div className="w-20 text-center">Severidade</div>
            <div className="w-20 text-center">Prioridade</div>
            <div className="flex-1">Issue</div>
            <div className="w-24 text-center">Status</div>
            <div className="w-32 text-center">Modificado</div>
            <div className="w-24 text-center">Atribuído</div>
          </div>

          {/* Lista */}
          {issuesFiltradas.length === 0 ? (
            <EmptyState
              title="Nenhuma issue encontrada"
              description="Crie uma nova issue para começar a rastrear bugs e melhorias."
              action={
                <Button variant="primary" onClick={handleNovaIssue}>
                  <Plus className="w-4 h-4" />
                  Nova Issue
                </Button>
              }
            />
          ) : (
            issuesFiltradas.map((issue) => (
              <div
                key={issue.id}
                className="flex items-center px-6 py-3 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleVerIssue(issue)}
              >
                <div className="w-16 flex justify-center">
                  <StatusDot color={TIPO_CONFIG[issue.tipo].cor} />
                </div>
                <div className="w-20 flex justify-center">
                  <StatusDot color={SEVERIDADE_CONFIG[issue.severidade].cor} />
                </div>
                <div className="w-20 flex justify-center">
                  <StatusDot color={PRIORIDADE_CONFIG[issue.prioridade].cor} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">#{issue.ref}</span>
                    <span className="font-medium text-gray-800">{issue.titulo}</span>
                  </div>
                  {mostrarTags && issue.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {issue.tags.map((tag) => (
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
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: STATUS_CONFIG[issue.status].cor + '20',
                      color: STATUS_CONFIG[issue.status].cor,
                    }}
                  >
                    {STATUS_CONFIG[issue.status].label}
                  </span>
                </div>
                <div className="w-32 text-center text-sm text-gray-500">
                  {formatarData(issue.dataModificacao)}
                </div>
                <div className="w-24 flex justify-center">
                  {issue.atribuido ? (
                    <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
                      U
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">-</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Issue */}
      <IssueModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        projetoId={projetoId}
      />
    </div>
  );
}

// ==========================================
// MODAL NOVA ISSUE
// ==========================================
interface IssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  projetoId: string;
}

function IssueModal({ isOpen, onClose, projetoId }: IssueModalProps) {
  const { adicionarIssue, usuarioAtual } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<TipoIssue>('bug');
  const [severidade, setSeveridade] = useState<Severidade>('normal');
  const [prioridade, setPrioridade] = useState<Prioridade>('normal');
  const [status, setStatus] = useState<StatusIssue>('novo');
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [atribuido, setAtribuido] = useState<string | undefined>(undefined);
  const [dropdownAtribuirAberto, setDropdownAtribuirAberto] = useState(false);

  const handleSalvar = () => {
    adicionarIssue({
      titulo,
      descricao,
      projeto: projetoId,
      tipo,
      severidade,
      prioridade,
      status,
      tags: [],
      anexos,
      comentarios: [],
      atribuido,
      observadores: [],
      criadoPor: usuarioAtual?.id || '',
      ordem: 999,
    });

    onClose();
    resetForm();
  };

  const resetForm = () => {
    setTitulo('');
    setDescricao('');
    setTipo('bug');
    setSeveridade('normal');
    setPrioridade('normal');
    setStatus('novo');
    setAnexos([]);
    setAtribuido(undefined);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const novosAnexos: Anexo[] = Array.from(files).map((file) => ({
        id: `anexo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nome: file.name,
        url: URL.createObjectURL(file),
        tipo: file.type,
        tamanho: file.size,
        isDeprecado: false,
        enviadoPor: usuarioAtual?.id || '',
        dataEnvio: new Date(),
      }));
      setAnexos((prev) => [...prev, ...novosAnexos]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      const novosAnexos: Anexo[] = Array.from(files).map((file) => ({
        id: `anexo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nome: file.name,
        url: URL.createObjectURL(file),
        tipo: file.type,
        tamanho: file.size,
        isDeprecado: false,
        enviadoPor: usuarioAtual?.id || '',
        dataEnvio: new Date(),
      }));
      setAnexos((prev) => [...prev, ...novosAnexos]);
    }
  };

  const handleRemoverAnexo = (anexoId: string) => {
    setAnexos((prev) => prev.filter((a) => a.id !== anexoId));
  };

  const handleAtribuirParaMim = () => {
    setAtribuido(usuarioAtual?.id);
    setDropdownAtribuirAberto(false);
  };

  const formatarTamanho = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nova issue"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSalvar} disabled={!titulo}>
            CRIAR
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="col-span-2 space-y-4">
          <div>
            <Input
              placeholder="Assunto"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="text-lg font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              + Adicionar tag
            </label>
          </div>

          <div>
            <Textarea
              placeholder="Adicione texto descritivo para ajudar outros a entender melhor esta issue"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={6}
            />
            <div className="text-xs text-gray-400 mt-1">Markdown</div>
          </div>

          {/* Anexos */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">{anexos.length} Anexos</div>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Solte anexos aqui ou clique para selecionar</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
            {anexos.length > 0 && (
              <div className="mt-3 space-y-2">
                {anexos.map((anexo) => (
                  <div key={anexo.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">{anexo.nome}</span>
                      <span className="text-xs text-gray-400">({formatarTamanho(anexo.tamanho)})</span>
                    </div>
                    <button
                      onClick={() => handleRemoverAnexo(anexo.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-4">
          <div>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusIssue)}
            >
              <option value="novo">Novo</option>
              <option value="emProgresso">Em Progresso</option>
              <option value="prontoParaTeste">Pronto para Teste</option>
              <option value="fechado">Fechado</option>
              <option value="precisaInfo">Precisa de Informação</option>
              <option value="rejeitado">Rejeitado</option>
            </Select>
          </div>

          {/* Atribuição */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Atribuição</label>
            <div className="flex gap-2">
              <button
                onClick={() => setDropdownAtribuirAberto(!dropdownAtribuirAberto)}
                className="flex-1 px-3 py-2 text-sm text-left border rounded-md hover:bg-gray-50"
              >
                {atribuido ? (atribuido === usuarioAtual?.id ? usuarioAtual?.nomeCompleto : 'Usuário') : 'Atribuir...'}
              </button>
              <button
                onClick={handleAtribuirParaMim}
                className="px-3 py-2 text-sm text-primary-600 border border-primary-300 rounded-md hover:bg-primary-50"
              >
                Atribuir a mim
              </button>
            </div>
            {dropdownAtribuirAberto && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                <div className="p-2 text-xs text-gray-500 border-b">Usuários (em breve)</div>
                <button
                  onClick={handleAtribuirParaMim}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50"
                >
                  {usuarioAtual?.nomeCompleto || 'Eu'}
                </button>
                {atribuido && (
                  <button
                    onClick={() => { setAtribuido(undefined); setDropdownAtribuirAberto(false); }}
                    className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-gray-50 border-t"
                  >
                    Remover atribuição
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">tipo</label>
            <div className="flex items-center gap-2">
              <Select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoIssue)}
                className="flex-1"
              >
                <option value="bug">Bug</option>
                <option value="melhoria">Melhoria</option>
                <option value="pergunta">Pergunta</option>
                <option value="suporte">Suporte</option>
              </Select>
              <StatusDot color={TIPO_CONFIG[tipo].cor} size="lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">severidade</label>
            <div className="flex items-center gap-2">
              <Select
                value={severidade}
                onChange={(e) => setSeveridade(e.target.value as Severidade)}
                className="flex-1"
              >
                <option value="wishlist">Desejável</option>
                <option value="minor">Menor</option>
                <option value="normal">Normal</option>
                <option value="important">Importante</option>
                <option value="critical">Crítico</option>
              </Select>
              <StatusDot color={SEVERIDADE_CONFIG[severidade].cor} size="lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">prioridade</label>
            <div className="flex items-center gap-2">
              <Select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                className="flex-1"
              >
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
              </Select>
              <StatusDot color={PRIORIDADE_CONFIG[prioridade].cor} size="lg" />
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="flex gap-2 pt-4 border-t">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
              🕐
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
              🔒
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
