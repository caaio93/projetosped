'use client';

import { useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useHydration } from '@/lib/useHydration';
import { formatarDataHora } from '@/lib/utils';
import Link from 'next/link';
import { 
  FileText, 
  CheckSquare, 
  AlertCircle, 
  Calendar, 
  BookOpen,
  MessageSquare,
  Paperclip,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import type { TipoAtividade } from '@/types';

const ICONES_ATIVIDADE: Record<TipoAtividade, React.ReactNode> = {
  criar_user_story: <FileText className="w-4 h-4 text-blue-500" />,
  atualizar_user_story: <RefreshCw className="w-4 h-4 text-blue-500" />,
  mover_user_story: <ArrowRight className="w-4 h-4 text-blue-500" />,
  criar_tarefa: <CheckSquare className="w-4 h-4 text-green-500" />,
  atualizar_tarefa: <RefreshCw className="w-4 h-4 text-green-500" />,
  atualizar_status_tarefa: <RefreshCw className="w-4 h-4 text-green-500" />,
  criar_issue: <AlertCircle className="w-4 h-4 text-red-500" />,
  atualizar_issue: <RefreshCw className="w-4 h-4 text-red-500" />,
  criar_sprint: <Calendar className="w-4 h-4 text-purple-500" />,
  atualizar_sprint: <RefreshCw className="w-4 h-4 text-purple-500" />,
  criar_wiki: <BookOpen className="w-4 h-4 text-orange-500" />,
  atualizar_wiki: <RefreshCw className="w-4 h-4 text-orange-500" />,
  adicionar_comentario: <MessageSquare className="w-4 h-4 text-gray-500" />,
  adicionar_anexo: <Paperclip className="w-4 h-4 text-gray-500" />,
};

export default function TimelinePage() {
  const params = useParams();
  const hydrated = useHydration();
  const projetoId = params.id as string;

  const { getAtividadesPorProjeto, getProjetoAtual } = useAppStore();

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
  const atividades = getAtividadesPorProjeto(projetoId);

  const getLinkEntidade = (atividade: typeof atividades[0]) => {
    if (!atividade.entidadeId || !atividade.entidadeTipo) return null;
    
    switch (atividade.entidadeTipo) {
      case 'user_story':
        return `/projeto/${projetoId}/userstory/${atividade.entidadeId}`;
      case 'sprint':
        return `/projeto/${projetoId}/sprint/${atividade.entidadeId}`;
      case 'wiki':
        return `/projeto/${projetoId}/wiki`;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {projeto?.nome || 'Projeto'}
              </h1>
              <p className="text-sm text-gray-500">{projeto?.slug}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Team</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {atividades.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma atividade ainda</h3>
              <p className="text-gray-500">
                As atividades do projeto aparecerão aqui conforme você trabalha.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {atividades.map((atividade) => {
                const link = getLinkEntidade(atividade);
                
                return (
                  <div
                    key={atividade.id}
                    className="flex items-start gap-4 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* Ícone */}
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {ICONES_ATIVIDADE[atividade.tipo]}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-primary-600">
                          {atividade.usuarioNome}
                        </span>
                        <span className="text-gray-600" dangerouslySetInnerHTML={{ __html: atividade.descricao }} />
                      </div>
                      
                      {/* Detalhes adicionais */}
                      {atividade.detalhes && (
                        <div className="mt-1 text-sm text-gray-500">
                          {atividade.detalhes.campo && (
                            <span>
                              {atividade.detalhes.campo}: {atividade.detalhes.valorAntigo} → {atividade.detalhes.valorNovo}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Data */}
                    <div className="flex-shrink-0 text-sm text-gray-400" suppressHydrationWarning>
                      {formatarDataHora(atividade.dataCriacao)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
