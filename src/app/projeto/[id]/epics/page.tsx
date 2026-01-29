'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useHydration } from '@/lib/useHydration';
import { Button, Modal, Input } from '@/components/ui';
import { Plus, ChevronDown, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StatusEpic } from '@/types';
import { STATUS_EPIC_CONFIG } from '@/types';

const CORES_EPIC = [
  '#8BC34A', '#4CAF50', '#009688', '#00BCD4', '#03A9F4',
  '#2196F3', '#3F51B5', '#673AB7', '#9C27B0', '#E91E63',
  '#F44336', '#FF5722', '#FF9800', '#FFC107', '#FFEB3B',
];

export default function EpicsPage() {
  const params = useParams();
  const router = useRouter();
  const hydrated = useHydration();
  const projetoId = params.id as string;

  const [modalNovoEpicAberto, setModalNovoEpicAberto] = useState(false);
  const [novoEpicTitulo, setNovoEpicTitulo] = useState('');
  const [novoEpicCor, setNovoEpicCor] = useState(CORES_EPIC[0]);

  const {
    getEpicsPorProjeto,
    adicionarEpic,
    atualizarEpic,
    getProjetoAtual,
    getUserStoryById,
    usuarioAtual,
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

  const projeto = getProjetoAtual();
  const epics = getEpicsPorProjeto(projetoId);

  const handleCriarEpic = () => {
    if (novoEpicTitulo.trim()) {
      const epicId = adicionarEpic({
        titulo: novoEpicTitulo.trim(),
        descricao: '',
        projeto: projetoId,
        status: 'novo',
        cor: novoEpicCor,
        userStories: [],
        tags: [],
        anexos: [],
        atribuidos: [],
        observadores: [],
        comentarios: [],
        criadoPor: usuarioAtual?.id || '',
        ordem: epics.length + 1,
      });
      setNovoEpicTitulo('');
      setNovoEpicCor(CORES_EPIC[0]);
      setModalNovoEpicAberto(false);
      router.push(`/projeto/${projetoId}/epics/${epicId}`);
    }
  };

  const handleAtualizarStatus = (epicId: string, novoStatus: StatusEpic) => {
    atualizarEpic(epicId, { status: novoStatus });
  };

  const calcularProgresso = (epic: typeof epics[0]) => {
    if (epic.userStories.length === 0) return 0;
    const userStoriesCompletas = epic.userStories.filter((usId) => {
      const us = getUserStoryById(usId);
      return us?.status === 'fechado';
    }).length;
    return Math.round((userStoriesCompletas / epic.userStories.length) * 100);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Epics</h1>
          <div className="flex items-center gap-4">
            <Button onClick={() => setModalNovoEpicAberto(true)}>
              <Plus className="w-4 h-4 mr-2" />
              ADD EPIC
            </Button>
            <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              View options
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Epics */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header da Tabela */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b bg-gray-50 text-xs font-medium text-gray-500 uppercase">
            <div className="col-span-5">Name</div>
            <div className="col-span-2 text-center">Project</div>
            <div className="col-span-1 text-center">Sprint</div>
            <div className="col-span-1 text-center">Assigned</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-2 text-center">Progress</div>
          </div>

          {/* Lista de Epics */}
          {epics.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum Epic criado ainda</p>
              <Button 
                variant="secondary" 
                className="mt-4"
                onClick={() => setModalNovoEpicAberto(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar primeiro Epic
              </Button>
            </div>
          ) : (
            <div>
              {epics.map((epic) => {
                const progresso = calcularProgresso(epic);
                const statusConfig = STATUS_EPIC_CONFIG[epic.status];
                
                return (
                  <div
                    key={epic.id}
                    className="grid grid-cols-12 gap-4 px-4 py-3 border-b hover:bg-gray-50 cursor-pointer items-center"
                    onClick={() => router.push(`/projeto/${projetoId}/epics/${epic.id}`)}
                  >
                    {/* Nome */}
                    <div className="col-span-5 flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: epic.cor }}
                      />
                      <span className="text-primary-500 font-mono">#{epic.ref}</span>
                      <span className="text-gray-900 truncate">{epic.titulo}</span>
                    </div>

                    {/* Project */}
                    <div className="col-span-2 text-center text-sm text-gray-500">
                      {projeto?.nome}
                    </div>

                    {/* Sprint */}
                    <div className="col-span-1 text-center text-sm text-gray-400">
                      -
                    </div>

                    {/* Assigned */}
                    <div className="col-span-1 flex justify-center">
                      {epic.atribuidos.length > 0 ? (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                          {epic.atribuidos.length}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-dashed border-gray-300" />
                      )}
                    </div>

                    {/* Status */}
                    <div className="col-span-1 text-center">
                      <StatusDropdown
                        status={epic.status}
                        onChange={(novoStatus) => {
                          handleAtualizarStatus(epic.id, novoStatus);
                        }}
                      />
                    </div>

                    {/* Progress */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 transition-all"
                            style={{ width: `${progresso}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-10 text-right">
                          {progresso}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo Epic */}
      <Modal
        isOpen={modalNovoEpicAberto}
        onClose={() => setModalNovoEpicAberto(false)}
        title="Novo Epic"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalNovoEpicAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarEpic} disabled={!novoEpicTitulo.trim()}>
              Criar Epic
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título do Epic
            </label>
            <Input
              value={novoEpicTitulo}
              onChange={(e) => setNovoEpicTitulo(e.target.value)}
              placeholder="Digite o título do Epic"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor do Epic
            </label>
            <div className="flex flex-wrap gap-2">
              {CORES_EPIC.map((cor) => (
                <button
                  key={cor}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    novoEpicCor === cor ? 'border-gray-800 scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: cor }}
                  onClick={() => setNovoEpicCor(cor)}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatusDropdown({ status, onChange }: { status: StatusEpic; onChange: (status: StatusEpic) => void }) {
  const [aberto, setAberto] = useState(false);
  const statusConfig = STATUS_EPIC_CONFIG[status];

  return (
    <div className="relative">
      <button
        className="px-2 py-1 text-xs font-medium rounded flex items-center gap-1"
        style={{ backgroundColor: statusConfig.cor, color: status === 'novo' ? '#fff' : '#000' }}
        onClick={(e) => {
          e.stopPropagation();
          setAberto(!aberto);
        }}
      >
        {statusConfig.label}
        <ChevronDown className="w-3 h-3" />
      </button>

      {aberto && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setAberto(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border py-1 z-20 min-w-[120px]">
            {(Object.keys(STATUS_EPIC_CONFIG) as StatusEpic[]).map((s) => (
              <button
                key={s}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(s);
                  setAberto(false);
                }}
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
  );
}
