'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus, FolderKanban, MoreVertical, Star, Archive, Users } from 'lucide-react';
import { cn, formatarData } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Button, Input, Modal, Textarea, Avatar, EmptyState, MarkdownEditor } from '@/components/ui';
import type { Projeto } from '@/types';

export default function HomePage() {
  const [modalAberto, setModalAberto] = useState(false);
  const [filtro, setFiltro] = useState('');

  const { projetos, adicionarProjeto, usuarioAtual } = useAppStore();

  const projetosFiltrados = projetos.filter(
    (p) =>
      !p.isArquivado &&
      (p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
        p.descricao.toLowerCase().includes(filtro.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center">
                <FolderKanban className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Meus Projetos</h1>
                <p className="text-sm text-gray-500">Gerenciador de Projetos Scrum</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {usuarioAtual && (
                <div className="flex items-center gap-2">
                  <Avatar nome={usuarioAtual.nomeCompleto} />
                  <span className="text-sm text-gray-700">{usuarioAtual.nomeCompleto}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Barra de ações */}
        <div className="flex items-center justify-between mb-6">
          <Input
            placeholder="Buscar projetos..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="primary" onClick={() => setModalAberto(true)}>
            <Plus className="w-4 h-4" />
            Novo Projeto
          </Button>
        </div>

        {/* Lista de projetos */}
        {projetosFiltrados.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="w-16 h-16" />}
            title="Nenhum projeto encontrado"
            description="Crie seu primeiro projeto para começar a gerenciar suas tarefas."
            action={
              <Button variant="primary" onClick={() => setModalAberto(true)}>
                <Plus className="w-4 h-4" />
                Criar Projeto
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projetosFiltrados.map((projeto) => (
              <ProjetoCard key={projeto.id} projeto={projeto} />
            ))}
          </div>
        )}
      </main>

      {/* Modal Novo Projeto */}
      <NovoProjetoModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
      />
    </div>
  );
}

// ==========================================
// PROJETO CARD
// ==========================================
interface ProjetoCardProps {
  projeto: Projeto;
}

function ProjetoCard({ projeto }: ProjetoCardProps) {
  return (
    <Link href={`/projeto/${projeto.id}/backlog`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary-500 flex items-center justify-center">
            <FolderKanban className="w-7 h-7 text-white" />
          </div>
          <button className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-500 transition-colors">
          {projeto.nome}
        </h3>
        <p 
          className="text-sm text-gray-500 line-clamp-2 mb-4"
          dangerouslySetInnerHTML={{ 
            __html: projeto.descricao 
              ? projeto.descricao.replace(/<[^>]*>/g, ' ').trim() || 'Sem descrição'
              : 'Sem descrição' 
          }}
        />

        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{projeto.membros.length || 1} membros</span>
          </div>
          <span>Criado em {formatarData(projeto.dataCriacao)}</span>
        </div>

        {/* Badges de módulos ativos */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          {projeto.scrumAtivo && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Scrum</span>
          )}
          {projeto.issuesAtivo && (
            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Issues</span>
          )}
          {projeto.wikiAtivo && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Wiki</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ==========================================
// MODAL NOVO PROJETO
// ==========================================
interface NovoProjetoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function NovoProjetoModal({ isOpen, onClose }: NovoProjetoModalProps) {
  const { adicionarProjeto, usuarioAtual, setProjetoAtual } = useAppStore();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isPrivado, setIsPrivado] = useState(false);

  const handleCriar = () => {
    if (!nome.trim()) return;

    const slug = nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const id = adicionarProjeto({
      nome: nome.trim(),
      descricao: descricao.trim(),
      slug,
      proprietario: usuarioAtual!,
      membros: [],
      isPrivado,
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
      totalPontos: 0,
      pontosDefinidos: 0,
      pontosFechados: 0,
    });

    setProjetoAtual(id);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setNome('');
    setDescricao('');
    setIsPrivado(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Projeto"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCriar} disabled={!nome.trim()}>
            Criar Projeto
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Projeto *
          </label>
          <Input
            placeholder="Ex: Meu Projeto Incrível"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <MarkdownEditor
            placeholder="Descreva o objetivo do projeto..."
            value={descricao}
            onChange={setDescricao}
            rows={3}
            showHelp={false}
          />
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPrivado}
              onChange={(e) => setIsPrivado(e.target.checked)}
              className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Projeto privado</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Projetos privados são visíveis apenas para membros convidados.
          </p>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Módulos habilitados</h4>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked
                disabled
                className="rounded border-gray-300 text-primary-500"
              />
              <span className="text-sm text-gray-700">Scrum</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked
                disabled
                className="rounded border-gray-300 text-primary-500"
              />
              <span className="text-sm text-gray-700">Issues</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked
                disabled
                className="rounded border-gray-300 text-primary-500"
              />
              <span className="text-sm text-gray-700">Wiki</span>
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}
