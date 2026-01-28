'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Edit, Trash2, Eye, FileText } from 'lucide-react';
import { cn, formatarData, gerarSlug } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Button, Input, Modal, EmptyState, MarkdownEditor } from '@/components/ui';
import type { WikiPage, WikiLink } from '@/types';

interface WikiProps {
  projetoId: string;
}

export function Wiki({ projetoId }: WikiProps) {
  const [paginaAtual, setPaginaAtual] = useState<string>('home');
  const [editando, setEditando] = useState(false);
  const [modalNovoLinkAberto, setModalNovoLinkAberto] = useState(false);
  const [conteudoEditado, setConteudoEditado] = useState('');

  const {
    getWikiPagesPorProjeto,
    getWikiPagePorSlug,
    getWikiLinksPorProjeto,
    adicionarWikiPage,
    atualizarWikiPage,
    adicionarWikiLink,
    excluirWikiLink,
    usuarioAtual,
  } = useAppStore();

  const links = getWikiLinksPorProjeto(projetoId);
  const pagina = getWikiPagePorSlug(projetoId, paginaAtual);

  useEffect(() => {
    if (pagina) {
      setConteudoEditado(pagina.conteudo);
    }
  }, [pagina]);

  const handleSelecionarPagina = (slug: string) => {
    setPaginaAtual(slug);
    setEditando(false);

    // Se a página não existir, criar uma nova
    const paginaExistente = getWikiPagePorSlug(projetoId, slug);
    if (!paginaExistente) {
      adicionarWikiPage({
        slug,
        titulo: slug,
        conteudo: '',
        projeto: projetoId,
        proprietario: usuarioAtual?.id || '',
        ultimoModificador: usuarioAtual?.id || '',
        observadores: [],
        totalObservadores: 0,
        anexos: [],
      });
    }
  };

  const handleSalvarConteudo = () => {
    if (pagina) {
      atualizarWikiPage(pagina.id, {
        conteudo: conteudoEditado,
        ultimoModificador: usuarioAtual?.id,
      });
    }
    setEditando(false);
  };

  const handleExcluirLink = (linkId: string) => {
    if (confirm('Tem certeza que deseja excluir este marcador?')) {
      excluirWikiLink(linkId);
    }
  };

  return (
    <div className="h-full flex">
      {/* Sidebar de Links/Bookmarks */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="px-4 py-3 border-b">
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
            MARCADORES
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {links.map((link) => (
            <div
              key={link.id}
              className={cn(
                'group flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors',
                paginaAtual === link.href && 'bg-gray-100 border-l-2 border-primary-500'
              )}
              onClick={() => handleSelecionarPagina(link.href)}
            >
              <span className="text-sm text-gray-700">{link.titulo}</span>
              {link.href !== 'home' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExcluirLink(link.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <button
            onClick={() => setModalNovoLinkAberto(true)}
            className="flex items-center gap-2 text-primary-500 text-sm font-medium hover:text-primary-600"
          >
            <Plus className="w-4 h-4" />
            Adicionar marcador
          </button>
        </div>
      </div>

      {/* Conteúdo da Wiki */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-primary-500">Wiki</h1>
            <div className="flex items-center gap-2">
              {editando ? (
                <>
                  <Button variant="secondary" onClick={() => setEditando(false)}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={handleSalvarConteudo}>
                    Salvar
                  </Button>
                </>
              ) : (
                <Button variant="ghost" onClick={() => setEditando(true)}>
                  <Edit className="w-4 h-4" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Área de conteúdo */}
        <div className="flex-1 overflow-auto p-6">
          {editando ? (
            <div className="max-w-4xl">
              <MarkdownEditor
                value={conteudoEditado}
                onChange={setConteudoEditado}
                rows={20}
                placeholder="Digite o conteúdo..."
              />
            </div>
          ) : (
            <div className="max-w-4xl">
              {pagina?.conteudo ? (
                <div 
                  className="wiki-content prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: pagina.conteudo }}
                />
              ) : (
                <div className="text-gray-400 italic">
                  Espaço vazio é tão entediante... vá em frente, seja descritivo...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Metadados */}
        {pagina && !editando && (
          <div className="bg-gray-50 border-t px-6 py-3 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>{pagina.edicoes} edições</span>
              <span>•</span>
              <span>Última modificação: {formatarData(pagina.dataModificacao)}</span>
              <span>•</span>
              <span>{pagina.totalObservadores} observadores</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal Novo Link */}
      <NovoLinkModal
        isOpen={modalNovoLinkAberto}
        onClose={() => setModalNovoLinkAberto(false)}
        projetoId={projetoId}
        onCriar={(titulo) => {
          const slug = gerarSlug(titulo);
          adicionarWikiLink({
            titulo,
            href: slug,
            projeto: projetoId,
            ordem: links.length + 1,
          });
          handleSelecionarPagina(slug);
        }}
      />
    </div>
  );
}

// ==========================================
// MODAL NOVO LINK
// ==========================================
interface NovoLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  projetoId: string;
  onCriar: (titulo: string) => void;
}

function NovoLinkModal({ isOpen, onClose, projetoId, onCriar }: NovoLinkModalProps) {
  const [titulo, setTitulo] = useState('');

  const handleCriar = () => {
    if (titulo.trim()) {
      onCriar(titulo.trim());
      setTitulo('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo marcador"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCriar} disabled={!titulo.trim()}>
            Criar
          </Button>
        </>
      }
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título do marcador
        </label>
        <Input
          placeholder="Ex: Guia de instalação"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCriar()}
          autoFocus
        />
        <p className="text-xs text-gray-500 mt-2">
          Um novo marcador será criado e uma página correspondente será gerada automaticamente.
        </p>
      </div>
    </Modal>
  );
}
