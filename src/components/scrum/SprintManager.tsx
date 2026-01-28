'use client';

import { useState } from 'react';
import { Plus, Calendar, Edit, Trash2, ChevronRight, MoreVertical, Play, CheckCircle } from 'lucide-react';
import { cn, formatarData } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Button, Input, Modal, ProgressBar } from '@/components/ui';
import type { Sprint } from '@/types';

interface SprintManagerProps {
  projetoId: string;
  onSelectSprint: (sprintId: string) => void;
}

export function SprintManager({ projetoId, onSelectSprint }: SprintManagerProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const [sprintEditando, setSprintEditando] = useState<Sprint | null>(null);
  const [menuAberto, setMenuAberto] = useState<string | null>(null);

  const {
    getSprintsPorProjeto,
    getUserStoriesPorSprint,
    adicionarSprint,
    atualizarSprint,
    excluirSprint,
  } = useAppStore();

  const sprints = getSprintsPorProjeto(projetoId);

  const handleNovoSprint = () => {
    setSprintEditando(null);
    setModalAberto(true);
  };

  const handleEditarSprint = (sprint: Sprint) => {
    setSprintEditando(sprint);
    setModalAberto(true);
    setMenuAberto(null);
  };

  const handleExcluirSprint = (sprintId: string) => {
    if (confirm('Tem certeza que deseja excluir este sprint? As User Stories voltarão para o backlog.')) {
      excluirSprint(sprintId);
    }
    setMenuAberto(null);
  };

  const handleFecharSprint = (sprintId: string) => {
    atualizarSprint(sprintId, { isFechado: true });
    setMenuAberto(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Sprints</h2>
        <Button variant="primary" size="sm" onClick={handleNovoSprint}>
          <Plus className="w-4 h-4" />
          Novo Sprint
        </Button>
      </div>

      {/* Lista de Sprints */}
      <div className="space-y-3">
        {sprints.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum sprint criado</p>
            <Button variant="primary" size="sm" className="mt-3" onClick={handleNovoSprint}>
              Criar primeiro sprint
            </Button>
          </div>
        ) : (
          sprints.map((sprint) => {
            const userStories = getUserStoriesPorSprint(sprint.id);
            const totalPontos = userStories.reduce((acc, us) => acc + (us.totalPontos || 0), 0);
            const pontosFechados = userStories
              .filter((us) => us.status === 'fechado')
              .reduce((acc, us) => acc + (us.totalPontos || 0), 0);
            // Percentual baseado em User Stories fechadas
            const totalUS = userStories.length;
            const usFechadas = userStories.filter((us) => us.status === 'fechado').length;
            const percentual = totalUS > 0 ? Math.round((usFechadas / totalUS) * 100) : 0;

            const hoje = new Date();
            const inicio = new Date(sprint.dataInicio);
            const fim = new Date(sprint.dataFim);
            const emAndamento = hoje >= inicio && hoje <= fim && !sprint.isFechado;
            const finalizado = sprint.isFechado || hoje > fim;

            return (
              <div
                key={sprint.id}
                className={cn(
                  'bg-white rounded-lg border p-4 hover:shadow-md transition-all cursor-pointer group',
                  emAndamento && 'border-l-4 border-l-primary-500',
                  finalizado && 'opacity-60'
                )}
                onClick={() => onSelectSprint(sprint.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {emAndamento && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                          <Play className="w-3 h-3" />
                          Ativo
                        </span>
                      )}
                      {sprint.isFechado && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Concluído
                        </span>
                      )}
                      <h3 className="font-semibold text-gray-800">{sprint.nome}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatarData(sprint.dataInicio)} — {formatarData(sprint.dataFim)}
                    </p>
                  </div>

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuAberto(menuAberto === sprint.id ? null : sprint.id);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {menuAberto === sprint.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border py-1 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditarSprint(sprint);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4" />
                          Editar sprint
                        </button>
                        {!sprint.isFechado && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFecharSprint(sprint.id);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Fechar sprint
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExcluirSprint(sprint.id);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir sprint
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Métricas */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">{userStories.length} histórias</span>
                    <span className="font-medium">{pontosFechados}/{totalPontos} pontos</span>
                  </div>
                  <ProgressBar value={percentual} color={sprint.isFechado ? '#a8e6cf' : '#00afaf'} />
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-gray-400">
                  <span>{sprint.tarefasAbertas} tarefas abertas</span>
                  <span>{sprint.tarefasFechadas} tarefas fechadas</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Sprint */}
      <SprintModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        sprint={sprintEditando}
        projetoId={projetoId}
      />
    </div>
  );
}

// ==========================================
// MODAL SPRINT
// ==========================================
interface SprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sprint: Sprint | null;
  projetoId: string;
}

function SprintModal({ isOpen, onClose, sprint, projetoId }: SprintModalProps) {
  const { adicionarSprint, atualizarSprint, getSprintsPorProjeto } = useAppStore();
  const sprints = getSprintsPorProjeto(projetoId);

  // Calcular próximas datas sugeridas
  const ultimoSprint = sprints[sprints.length - 1];
  const dataInicioSugerida = ultimoSprint
    ? new Date(new Date(ultimoSprint.dataFim).getTime() + 86400000).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  const dataFimSugerida = new Date(
    new Date(dataInicioSugerida).getTime() + 13 * 86400000
  ).toISOString().split('T')[0];

  const [nome, setNome] = useState(sprint?.nome || `Sprint ${sprints.length + 1}`);
  const [dataInicio, setDataInicio] = useState(
    sprint?.dataInicio
      ? new Date(sprint.dataInicio).toISOString().split('T')[0]
      : dataInicioSugerida
  );
  const [dataFim, setDataFim] = useState(
    sprint?.dataFim
      ? new Date(sprint.dataFim).toISOString().split('T')[0]
      : dataFimSugerida
  );

  const handleSalvar = () => {
    const dados = {
      nome,
      dataInicio: new Date(dataInicio),
      dataFim: new Date(dataFim),
    };

    if (sprint) {
      atualizarSprint(sprint.id, dados);
    } else {
      adicionarSprint({
        ...dados,
        projeto: projetoId,
        userStories: [],
        totalPontos: 0,
        pontosCompletados: 0,
        tarefasAbertas: 0,
        tarefasFechadas: 0,
        isFechado: false,
        ordem: sprints.length + 1,
      });
    }

    onClose();
  };

  // Validar datas não sobrepostas
  const validarDatas = () => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    if (fim <= inicio) return 'Data de fim deve ser após a data de início';
    
    for (const s of sprints) {
      if (sprint && s.id === sprint.id) continue;
      const sInicio = new Date(s.dataInicio);
      const sFim = new Date(s.dataFim);
      
      if (
        (inicio >= sInicio && inicio <= sFim) ||
        (fim >= sInicio && fim <= sFim) ||
        (inicio <= sInicio && fim >= sFim)
      ) {
        return `Datas conflitam com o sprint "${s.nome}"`;
      }
    }
    
    return null;
  };

  const erro = validarDatas();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sprint ? 'Editar Sprint' : 'Novo Sprint'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSalvar} disabled={!!erro || !nome.trim()}>
            {sprint ? 'Salvar' : 'Criar Sprint'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Sprint
          </label>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Sprint 1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Início
            </label>
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Término
            </label>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
        </div>

        {erro && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {erro}
          </div>
        )}

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Duração</h4>
          <p className="text-2xl font-bold text-primary-600">
            {Math.ceil((new Date(dataFim).getTime() - new Date(dataInicio).getTime()) / 86400000) + 1} dias
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {Math.ceil((new Date(dataFim).getTime() - new Date(dataInicio).getTime()) / 86400000 / 7)} semanas
          </p>
        </div>
      </div>
    </Modal>
  );
}
