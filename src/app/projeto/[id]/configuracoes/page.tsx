'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, Trash2, Archive, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button, Input, Textarea, Tabs, MarkdownEditor } from '@/components/ui';

export default function ConfiguracoesPage() {
  const params = useParams();
  const router = useRouter();
  const projetoId = params.id as string;
  const [abaAtiva, setAbaAtiva] = useState('geral');

  const { getProjetoAtual, atualizarProjeto, excluirProjeto } = useAppStore();
  const projeto = getProjetoAtual();

  const [nome, setNome] = useState(projeto?.nome || '');
  const [descricao, setDescricao] = useState(projeto?.descricao || '');
  const [isPrivado, setIsPrivado] = useState(projeto?.isPrivado || false);

  const handleSalvar = () => {
    if (!nome.trim()) {
      alert('O nome do projeto é obrigatório.');
      return;
    }
    atualizarProjeto(projetoId, {
      nome,
      descricao,
      isPrivado,
    });
    alert('Alterações salvas com sucesso!');
  };

  const handleExcluir = () => {
    if (confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) {
      excluirProjeto(projetoId);
      router.push('/');
    }
  };

  const handleArquivar = () => {
    if (confirm('Tem certeza que deseja arquivar este projeto?')) {
      atualizarProjeto(projetoId, { isArquivado: true });
      router.push('/');
    }
  };

  const abas = [
    { id: 'geral', label: 'Geral' },
    { id: 'modulos', label: 'Módulos' },
    { id: 'pontos', label: 'Pontos' },
    { id: 'status', label: 'Status' },
    { id: 'permissoes', label: 'Permissões' },
    { id: 'avancado', label: 'Avançado' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-primary-500">Configurações</h1>
          <Button variant="primary" onClick={handleSalvar}>
            <Save className="w-4 h-4" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6">
        <Tabs tabs={abas} activeTab={abaAtiva} onChange={setAbaAtiva} />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl">
          {abaAtiva === 'geral' && (
            <div className="space-y-6">
              {/* Informações básicas */}
              <section className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Informações do Projeto
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Projeto
                    </label>
                    <Input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <MarkdownEditor
                      value={descricao}
                      onChange={setDescricao}
                      placeholder="Descreva o projeto..."
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
                  </div>
                </div>
              </section>

              {/* Zona de perigo */}
              <section className="bg-white rounded-lg border border-red-200 p-6">
                <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Zona de Perigo
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800">Arquivar Projeto</h3>
                      <p className="text-sm text-gray-500">
                        O projeto será arquivado e não aparecerá mais na lista principal.
                      </p>
                    </div>
                    <Button variant="secondary" onClick={handleArquivar}>
                      <Archive className="w-4 h-4" />
                      Arquivar
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-red-800">Excluir Projeto</h3>
                      <p className="text-sm text-red-600">
                        Esta ação é irreversível. Todos os dados serão perdidos.
                      </p>
                    </div>
                    <Button variant="danger" onClick={handleExcluir}>
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {abaAtiva === 'modulos' && (
            <section className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Módulos Ativos
              </h2>
              <div className="space-y-4">
                {[
                  { id: 'scrum', nome: 'Scrum', descricao: 'Backlog, User Stories, Sprints e Taskboard' },
                  { id: 'issues', nome: 'Issues', descricao: 'Rastreamento de bugs e melhorias' },
                  { id: 'wiki', nome: 'Wiki', descricao: 'Documentação do projeto' },
                ].map((modulo) => (
                  <div
                    key={modulo.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-800">{modulo.nome}</h3>
                      <p className="text-sm text-gray-500">{modulo.descricao}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </section>
          )}

          {abaAtiva === 'pontos' && (
            <section className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Categorias de Pontos
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Defina as categorias usadas para estimar User Stories.
              </p>
              <div className="space-y-2">
                {projeto?.categoriaPontos.map((cat, index) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2"
                  >
                    <span className="w-8 text-center text-sm text-gray-400">
                      {index + 1}
                    </span>
                    <Input defaultValue={cat.nome} className="flex-1" />
                    <button className="p-2 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <Button variant="ghost" className="mt-2">
                  + Adicionar categoria
                </Button>
              </div>
            </section>
          )}

          {abaAtiva === 'status' && (
            <section className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Status Personalizados
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Configure os status disponíveis para User Stories, Tarefas e Issues.
              </p>
              <div className="space-y-4">
                {[
                  { nome: 'Novo', cor: '#70728f' },
                  { nome: 'Em Progresso', cor: '#e44057' },
                  { nome: 'Pronto para Teste', cor: '#ffc107' },
                  { nome: 'Fechado', cor: '#a8e6cf' },
                  { nome: 'Precisa de Informação', cor: '#ff9800' },
                ].map((status) => (
                  <div
                    key={status.nome}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: status.cor }}
                    />
                    <Input defaultValue={status.nome} className="flex-1" />
                    <input
                      type="color"
                      defaultValue={status.cor}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {abaAtiva === 'permissoes' && (
            <section className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Permissões
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Gerencie as permissões para cada papel do projeto.
              </p>
              <div className="text-gray-500 text-center py-8">
                Em construção...
              </div>
            </section>
          )}

          {abaAtiva === 'avancado' && (
            <section className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Configurações Avançadas
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Exportar Projeto</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Exporte todos os dados do projeto em formato JSON.
                  </p>
                  <Button variant="secondary">Exportar</Button>
                </div>
                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-700 mb-2">Importar Dados</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Importe dados de outros gerenciadores de projeto.
                  </p>
                  <Button variant="secondary">Importar</Button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
