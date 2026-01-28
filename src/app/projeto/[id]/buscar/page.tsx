'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Search, FileText, CheckSquare, AlertCircle, BookOpen, X, Filter } from 'lucide-react';
import { cn, formatarData } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Input, Badge, Tabs } from '@/components/ui';

type TipoResultado = 'todos' | 'userStory' | 'tarefa' | 'issue' | 'wiki';

interface ResultadoBusca {
  id: string;
  tipo: TipoResultado;
  ref?: number;
  titulo: string;
  descricao?: string;
  status?: string;
  data: Date;
}

export default function BuscaPage() {
  const params = useParams();
  const router = useRouter();
  const projetoId = params.id as string;

  const [termo, setTermo] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoResultado>('todos');

  const {
    getUserStoriesPorProjeto,
    getTarefasPorSprint,
    getIssuesPorProjeto,
    getWikiPagesPorProjeto,
    tarefas,
  } = useAppStore();

  const userStories = getUserStoriesPorProjeto(projetoId);
  const issues = getIssuesPorProjeto(projetoId);
  const wikiPages = getWikiPagesPorProjeto(projetoId);
  const tarefasProjeto = tarefas.filter((t) => t.projeto === projetoId);

  // Realizar busca
  const resultados = useMemo(() => {
    if (!termo.trim()) return [];

    const termoLower = termo.toLowerCase();
    const termoRef = termo.startsWith('#') ? parseInt(termo.slice(1)) : null;
    const results: ResultadoBusca[] = [];

    // Buscar em User Stories
    if (tipoFiltro === 'todos' || tipoFiltro === 'userStory') {
      userStories.forEach((us) => {
        if (
          (termoRef && us.ref === termoRef) ||
          us.titulo.toLowerCase().includes(termoLower) ||
          us.descricao.toLowerCase().includes(termoLower)
        ) {
          results.push({
            id: us.id,
            tipo: 'userStory',
            ref: us.ref,
            titulo: us.titulo,
            descricao: us.descricao,
            status: us.status,
            data: us.dataModificacao,
          });
        }
      });
    }

    // Buscar em Tarefas
    if (tipoFiltro === 'todos' || tipoFiltro === 'tarefa') {
      tarefasProjeto.forEach((t) => {
        if (
          (termoRef && t.ref === termoRef) ||
          t.titulo.toLowerCase().includes(termoLower) ||
          t.descricao.toLowerCase().includes(termoLower)
        ) {
          results.push({
            id: t.id,
            tipo: 'tarefa',
            ref: t.ref,
            titulo: t.titulo,
            descricao: t.descricao,
            status: t.status,
            data: t.dataModificacao,
          });
        }
      });
    }

    // Buscar em Issues
    if (tipoFiltro === 'todos' || tipoFiltro === 'issue') {
      issues.forEach((i) => {
        if (
          (termoRef && i.ref === termoRef) ||
          i.titulo.toLowerCase().includes(termoLower) ||
          i.descricao.toLowerCase().includes(termoLower)
        ) {
          results.push({
            id: i.id,
            tipo: 'issue',
            ref: i.ref,
            titulo: i.titulo,
            descricao: i.descricao,
            status: i.status,
            data: i.dataModificacao,
          });
        }
      });
    }

    // Buscar em Wiki
    if (tipoFiltro === 'todos' || tipoFiltro === 'wiki') {
      wikiPages.forEach((w) => {
        if (
          w.titulo.toLowerCase().includes(termoLower) ||
          w.conteudo.toLowerCase().includes(termoLower)
        ) {
          results.push({
            id: w.id,
            tipo: 'wiki',
            titulo: w.titulo,
            descricao: w.conteudo.substring(0, 200),
            data: w.dataModificacao,
          });
        }
      });
    }

    return results.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [termo, tipoFiltro, userStories, tarefasProjeto, issues, wikiPages]);

  const handleResultadoClick = (resultado: ResultadoBusca) => {
    switch (resultado.tipo) {
      case 'userStory':
        router.push(`/projeto/${projetoId}/backlog?us=${resultado.id}`);
        break;
      case 'tarefa':
        router.push(`/projeto/${projetoId}/backlog?tarefa=${resultado.id}`);
        break;
      case 'issue':
        router.push(`/projeto/${projetoId}/issues?issue=${resultado.id}`);
        break;
      case 'wiki':
        router.push(`/projeto/${projetoId}/wiki?page=${resultado.id}`);
        break;
    }
  };

  const getIconeTipo = (tipo: TipoResultado) => {
    switch (tipo) {
      case 'userStory':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'tarefa':
        return <CheckSquare className="w-5 h-5 text-green-500" />;
      case 'issue':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'wiki':
        return <BookOpen className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getLabelTipo = (tipo: TipoResultado) => {
    switch (tipo) {
      case 'userStory':
        return 'História de Usuário';
      case 'tarefa':
        return 'Tarefa';
      case 'issue':
        return 'Issue';
      case 'wiki':
        return 'Wiki';
      default:
        return tipo;
    }
  };

  const contadores = {
    todos: userStories.length + tarefasProjeto.length + issues.length + wikiPages.length,
    userStory: resultados.filter((r) => r.tipo === 'userStory').length,
    tarefa: resultados.filter((r) => r.tipo === 'tarefa').length,
    issue: resultados.filter((r) => r.tipo === 'issue').length,
    wiki: resultados.filter((r) => r.tipo === 'wiki').length,
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-semibold text-primary-500 mb-4">Buscar</h1>

        {/* Campo de busca */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar por título, descrição ou referência (#123)..."
            className="w-full pl-12 pr-10 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            autoFocus
          />
          {termo && (
            <button
              onClick={() => setTermo('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filtros por tipo */}
        {termo && (
          <div className="flex gap-2 mt-4">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'userStory', label: 'Histórias', icon: FileText },
              { id: 'tarefa', label: 'Tarefas', icon: CheckSquare },
              { id: 'issue', label: 'Issues', icon: AlertCircle },
              { id: 'wiki', label: 'Wiki', icon: BookOpen },
            ].map((filtro) => (
              <button
                key={filtro.id}
                onClick={() => setTipoFiltro(filtro.id as TipoResultado)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  tipoFiltro === filtro.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {filtro.icon && <filtro.icon className="w-4 h-4" />}
                {filtro.label}
                {termo && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                    {contadores[filtro.id as TipoResultado]}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="flex-1 overflow-auto p-6">
        {!termo ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-600 mb-2">
              Busque em todo o projeto
            </h2>
            <p className="text-gray-400">
              Use termos de busca ou referências como #123 para encontrar itens rapidamente
            </p>
          </div>
        ) : resultados.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-600 mb-2">
              Nenhum resultado encontrado
            </h2>
            <p className="text-gray-400">
              Tente usar termos diferentes ou verificar a ortografia
            </p>
          </div>
        ) : (
          <div className="max-w-4xl">
            <p className="text-sm text-gray-500 mb-4">
              {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} encontrado
              {resultados.length !== 1 ? 's' : ''}
            </p>

            <div className="space-y-3">
              {resultados.map((resultado) => (
                <div
                  key={`${resultado.tipo}-${resultado.id}`}
                  onClick={() => handleResultadoClick(resultado)}
                  className="flex items-start gap-4 p-4 bg-white border rounded-lg hover:shadow-md hover:border-primary-300 transition-all cursor-pointer"
                >
                  <div className="mt-1">{getIconeTipo(resultado.tipo)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 uppercase">
                        {getLabelTipo(resultado.tipo)}
                      </span>
                      {resultado.ref && (
                        <span className="text-xs text-gray-500">#{resultado.ref}</span>
                      )}
                      {resultado.status && (
                        <Badge color="#70728f" size="sm">
                          {resultado.status}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{resultado.titulo}</h3>
                    {resultado.descricao && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {resultado.descricao}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Modificado em {formatarData(resultado.data)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
