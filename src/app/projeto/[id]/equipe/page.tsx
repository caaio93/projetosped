'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Mail, Shield, Crown, MoreVertical, UserPlus } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button, Input, Modal, Avatar, EmptyState } from '@/components/ui';
import { formatarData } from '@/lib/utils';

export default function EquipePage() {
  const params = useParams();
  const projetoId = params.id as string;
  const [modalConviteAberto, setModalConviteAberto] = useState(false);

  const { getProjetoAtual, usuarioAtual } = useAppStore();
  const projeto = getProjetoAtual();

  // Membros mockados (proprietário + membros do projeto)
  const membros = [
    {
      id: usuarioAtual?.id || '1',
      usuario: usuarioAtual,
      papel: 'Administrador',
      isAdmin: true,
      dataEntrada: projeto?.dataCriacao || new Date(),
    },
    ...((projeto?.membros || []).map((m) => ({
      ...m,
      papel: m.papel?.nome || 'Membro',
    }))),
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-primary-500">Equipe</h1>
            <p className="text-sm text-gray-500">{membros.length} membros no projeto</p>
          </div>
          <Button variant="primary" onClick={() => setModalConviteAberto(true)}>
            <UserPlus className="w-4 h-4" />
            Convidar Membro
          </Button>
        </div>
      </div>

      {/* Lista de membros */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg border">
          {/* Header da tabela */}
          <div className="flex items-center px-6 py-3 border-b bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <div className="flex-1">Membro</div>
            <div className="w-32">Papel</div>
            <div className="w-40">Entrou em</div>
            <div className="w-20"></div>
          </div>

          {/* Lista */}
          {membros.map((membro) => (
            <div
              key={membro.id}
              className="flex items-center px-6 py-4 border-b hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 flex items-center gap-3">
                <Avatar nome={membro.usuario?.nomeCompleto} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {membro.usuario?.nomeCompleto}
                    </span>
                    {membro.isAdmin && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{membro.usuario?.email}</span>
                </div>
              </div>
              <div className="w-32">
                <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                  {membro.papel}
                </span>
              </div>
              <div className="w-40 text-sm text-gray-500">
                {formatarData(membro.dataEntrada)}
              </div>
              <div className="w-20 flex justify-end">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Seção de Papéis */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Papéis do Projeto</h2>
          <div className="bg-white rounded-lg border p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Administrador', 'Desenvolvedor', 'Designer', 'Product Owner', 'Scrum Master', 'Stakeholder'].map(
                (papel) => (
                  <div
                    key={papel}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
                  >
                    <Shield className="w-5 h-5 text-primary-500" />
                    <span className="font-medium text-gray-700">{papel}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Convite */}
      <Modal
        isOpen={modalConviteAberto}
        onClose={() => setModalConviteAberto(false)}
        title="Convidar Membro"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalConviteAberto(false)}>
              Cancelar
            </Button>
            <Button variant="primary">
              <Mail className="w-4 h-4" />
              Enviar Convite
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail do novo membro
            </label>
            <Input placeholder="email@exemplo.com" type="email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Papel
            </label>
            <select className="input">
              <option>Desenvolvedor</option>
              <option>Designer</option>
              <option>Product Owner</option>
              <option>Scrum Master</option>
              <option>Stakeholder</option>
            </select>
          </div>
          <p className="text-sm text-gray-500">
            Um e-mail de convite será enviado para o endereço informado. O usuário poderá
            aceitar o convite e criar uma conta se ainda não tiver uma.
          </p>
        </div>
      </Modal>
    </div>
  );
}
