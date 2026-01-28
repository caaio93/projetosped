'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAppStore } from '@/lib/store';

export default function ProjetoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const projetoId = params.id as string;
  const { setProjetoAtual } = useAppStore();

  useEffect(() => {
    if (projetoId) {
      setProjetoAtual(projetoId);
    }
  }, [projetoId, setProjetoAtual]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar projetoId={projetoId} />
      <div className="ml-44">
        <Header />
        <main className="h-[calc(100vh-48px)] overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
